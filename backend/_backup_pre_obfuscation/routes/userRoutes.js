const express = require('express');
const router = express.Router();
const { verifyToken, hashPassword, comparePassword } = require('../utils/crypto');
const db = require('../utils/db');

// ── Middleware de autenticación ──────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }
    const decoded = verifyToken(authHeader.split(' ')[1]);
    if (!decoded) return res.status(401).json({ error: 'Token inválido o expirado' });
    req.user = decoded; // { id, email, nombre, apellido, ... } del authService
    next();
};

// ── Helper: obtiene (o crea) el usuario local vinculado al authService ───────
const getOrCreateLocalUser = (authUserId, email, firstName, lastName) => {
    return new Promise((resolve, reject) => {
        // 1. Buscar por auth_user_id
        db.get('SELECT * FROM Users WHERE auth_user_id = ?', [authUserId], (err, row) => {
            if (err) return reject(err);
            if (row) return resolve(row);

            // 2. Buscar usuario legacy por email y vincularlo
            db.get('SELECT * FROM Users WHERE email = ?', [email], (err, legacy) => {
                if (err) return reject(err);
                if (legacy) {
                    db.run('UPDATE Users SET auth_user_id = ? WHERE email = ?', [authUserId, email], (err) => {
                        if (err) return reject(err);
                        resolve({ ...legacy, auth_user_id: authUserId });
                    });
                    return;
                }

                // 3. Crear nuevo usuario local
                const query = `INSERT INTO Users (first_name, last_name, email, password_hash, auth_user_id) VALUES (?, ?, ?, ?, ?)`;
                db.run(query, [firstName, lastName, email, 'sso-user', authUserId], function (err) {
                    if (err) return reject(err);
                    const userId = this.lastID;
                    db.run('INSERT INTO Wallet (user_id, points) VALUES (?, ?)', [userId, 500], (err) => {
                        if (err) console.error('Error creando wallet para usuario SSO:', err);
                    });
                    db.get('SELECT * FROM Users WHERE id = ?', [userId], (err, newRow) => {
                        if (err) return reject(err);
                        resolve(newRow);
                    });
                });
            });
        });
    });
};

// ── Rutas protegidas ─────────────────────────────────────────────────────────

router.get('/userInfo', authMiddleware, async (req, res) => {
    try {
        const localUser = await getOrCreateLocalUser(req.user.id, req.user.email, req.user.nombre, req.user.apellido);
        const query = `
            SELECT Users.first_name, Users.last_name, Users.phone, Users.email, Users.birth_date,
                   Wallet.points, Users.access_level,
                   (SELECT name       FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelName,
                   (SELECT hex_bkg    FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelBkg,
                   (SELECT hex_text   FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelText,
                   (SELECT min_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelMin,
                   (SELECT max_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelMax,
                   (SELECT name       FROM Levels WHERE min_points > (SELECT max_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) ORDER BY min_points ASC LIMIT 1) AS nextLevelName,
                   (SELECT COUNT(*) FROM Tickets WHERE user_id = Users.id) AS ticket_count
            FROM Users
            LEFT JOIN Wallet ON Users.id = Wallet.user_id
            WHERE Users.id = ?
        `;
        db.get(query, [localUser.id], (err, row) => {
            if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
            res.json(row);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/transactions', authMiddleware, async (req, res) => {
    try {
        const localUser = await getOrCreateLocalUser(req.user.id, req.user.email, req.user.nombre, req.user.apellido);
        db.all(
            'SELECT * FROM Point_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 50',
            [localUser.id],
            (err, rows) => {
                if (err) return res.status(500).json({ error: 'Error al consultar transacciones' });
                res.json(rows);
            }
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/levels', (req, res) => {
    db.all('SELECT id, name, min_points, max_points, hex_bkg, hex_text FROM Levels ORDER BY min_points ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener los niveles' });
        res.json(rows);
    });
});

router.put('/perfil', authMiddleware, async (req, res) => {
    try {
        const localUser = await getOrCreateLocalUser(req.user.id, req.user.email, req.user.nombre, req.user.apellido);
        const { first_name, last_name, phone } = req.body;
        if (!first_name || !last_name) {
            return res.status(400).json({ error: 'Nombre y apellidos son obligatorios' });
        }
        db.run(
            'UPDATE Users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
            [first_name, last_name, phone || null, localUser.id],
            function (err) {
                if (err) return res.status(500).json({ error: 'Error al actualizar el perfil' });
                res.json({ message: 'Perfil actualizado correctamente' });
            }
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/password', authMiddleware, async (req, res) => {
    try {
        const localUser = await getOrCreateLocalUser(req.user.id, req.user.email, req.user.nombre, req.user.apellido);
        const { password_actual, password_nueva } = req.body;
        if (!password_actual || !password_nueva) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
        if (password_nueva.length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }
        db.get('SELECT password_hash FROM Users WHERE id = ?', [localUser.id], (err, user) => {
            if (err) return res.status(500).json({ error: 'Error de base de datos' });
            if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
            if (user.password_hash === 'sso-user') {
                return res.status(400).json({ error: 'Para cambiar la contraseña usa el portal central de O Retiro' });
            }
            if (!comparePassword(password_actual, user.password_hash)) {
                return res.status(401).json({ error: 'La contraseña actual no es correcta' });
            }
            db.run('UPDATE Users SET password_hash = ? WHERE id = ?', [hashPassword(password_nueva), localUser.id], function (err) {
                if (err) return res.status(500).json({ error: 'Error al actualizar la contraseña' });
                res.json({ message: 'Contraseña actualizada correctamente' });
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/claim-birthday', authMiddleware, async (req, res) => {
    try {
        const localUser = await getOrCreateLocalUser(req.user.id, req.user.email, req.user.nombre, req.user.apellido);
        db.get('SELECT birth_date FROM Users WHERE id = ?', [localUser.id], (err, user) => {
            if (err) return res.status(500).json({ error: 'Error BD' });
            if (!user || !user.birth_date) return res.status(400).json({ error: 'Fecha de nacimiento no registrada' });

            const today = new Date();
            const birthDate = new Date(user.birth_date);
            if (today.getMonth() !== birthDate.getMonth() || today.getDate() !== birthDate.getDate()) {
                return res.status(400).json({ error: 'Hoy no es tu cumpleaños' });
            }

            const currentYear = today.getFullYear();
            db.get(
                "SELECT id FROM Point_transactions WHERE user_id = ? AND type = 'birthday_reward' AND strftime('%Y', created_at) = ?",
                [localUser.id, currentYear.toString()],
                (err, row) => {
                    if (err) return res.status(500).json({ error: 'Error al comprobar recompensas' });
                    if (row) return res.status(400).json({ error: 'Ya has reclamado tu recompensa de cumpleaños este año' });

                    const pointsReward = 500;
                    db.get('SELECT id FROM Wallet WHERE user_id = ?', [localUser.id], (err, wallet) => {
                        if (err) return res.status(500).json({ error: 'Error obteniendo wallet' });
                        const walletId = wallet ? wallet.id : null;
                        db.run(
                            "INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type) VALUES (?, ?, ?, 'birthday_reward')",
                            [localUser.id, walletId, pointsReward],
                            function (err) {
                                if (err) return res.status(500).json({ error: 'Error guardando transacción' });
                                db.run('UPDATE Wallet SET points = points + ? WHERE user_id = ?', [pointsReward, localUser.id], (err) => {
                                    if (err) return res.status(500).json({ error: 'Error actualizando billetera' });
                                    res.json({ message: '¡Feliz Cumpleaños! Se han añadido 500 puntos a tu cartera.' });
                                });
                            }
                        );
                    });
                }
            );
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
