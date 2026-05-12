const express = require('express');
const router = express.Router();
const { encrypt, decrypt, hashPassword, comparePassword } = require('../utils/crypto');
const db = require('../utils/db');

function getTokenUserId(req, res) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
        return null;
    }
    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId) {
        res.status(401).json({ error: 'Token inválido' });
        return null;
    }
    return userId;
}

//Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM Users WHERE email = ?', [email], (err, user) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        if (!user)
            return res.status(401).json({ error: 'Usuario no encontrado' });

        const isValid = comparePassword(password, user.password_hash);

        db.run(
            'INSERT INTO login_log (user_id, success, ip_address) VALUES (?, ?, ?)',
            [user.id, isValid, req.ip]
        );

        if (!isValid)
            return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = encrypt(user.id);
        const userInfo = {
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            email: user.email,
        };

        res.json({ token, userInfo });
    });
});

//Register
router.post('/register', (req, res) => {
    const { firstName, lastName, phone, email, password, birthDate } = req.body;

    db.get('SELECT id FROM Users WHERE email = ?', [email], (err, existingUser) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        if (existingUser)
            return res.status(401).json({ error: 'Usuario ya registrado' });

        const passwordHash = hashPassword(password);
        const insertUserQuery = `
            INSERT INTO Users (first_name, last_name, phone, email, password_hash, birth_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(insertUserQuery, [firstName, lastName, phone, email, passwordHash, birthDate || null], function (err) {
            if (err)
                return res.status(500).json({ error: 'Error al registrar el usuario' });

            const newUserId = this.lastID;
            const insertWalletQuery = 'INSERT INTO Wallet (user_id, points) VALUES (?, ?)';

            db.run(insertWalletQuery, [newUserId, 500], (err) => {
                if (err) console.error('Error al crear la billetera:', err);
                res.json({ message: 'Usuario registrado correctamente' });
            });
        });
    });
});

//GET userInfo
router.get('/userInfo', (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    const query = `
        SELECT
            Users.first_name,
            Users.last_name,
            Users.phone,
            Users.email,
            Users.birth_date,
            Wallet.points,
            Users.access_level,
            (SELECT name       FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelName,
            (SELECT hex_bkg    FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelBkg,
            (SELECT hex_text   FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelText,
            (SELECT min_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelMin,
            (SELECT max_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points) AS levelMax,
            (SELECT name       FROM Levels
                WHERE min_points > (SELECT max_points FROM Levels WHERE Wallet.points >= min_points AND Wallet.points <= max_points)
                ORDER BY min_points ASC LIMIT 1) AS nextLevelName,
            (SELECT COUNT(*) FROM Tickets WHERE user_id = Users.id) AS ticket_count
        FROM Users
        LEFT JOIN Wallet ON Users.id = Wallet.user_id
        WHERE Users.id = ?
    `;

    db.get(query, [userId], (err, row) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        res.json(row);
    });
});

//GET transactions
router.get('/transactions', (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    const query = `
        SELECT * FROM Point_transactions
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 50
    `;

    db.all(query, [userId], (err, rows) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar transacciones' });
        res.json(rows);
    });
});

//Get levels
router.get('/levels', (req, res) => {
    const query = 'SELECT id, name, min_points, max_points, hex_bkg, hex_text FROM Levels ORDER BY min_points ASC';

    db.all(query, [], (err, rows) => {
        if (err)
            return res.status(500).json({ error: 'Error al obtener los niveles' });
        res.json(rows);
    });
});

//Put perfil
router.put('/perfil', (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    const { first_name, last_name, phone } = req.body;

    if (!first_name || !last_name)
        return res.status(400).json({ error: 'Nombre y apellidos son obligatorios' });

    db.run(
        'UPDATE Users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?',
        [first_name, last_name, phone || null, userId],
        function (err) {
            if (err)
                return res.status(500).json({ error: 'Error al actualizar el perfil' });
            res.json({ message: 'Perfil actualizado correctamente' });
        }
    );
});

//Put password
router.put('/password', (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    const { password_actual, password_nueva } = req.body;

    if (!password_actual || !password_nueva)
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    if (password_nueva.length < 6)
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });

    db.get('SELECT password_hash FROM Users WHERE id = ?', [userId], (err, user) => {
        if (err)
            return res.status(500).json({ error: 'Error de base de datos' });
        if (!user)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        if (!comparePassword(password_actual, user.password_hash))
            return res.status(401).json({ error: 'La contraseña actual no es correcta' });

        const newHash = hashPassword(password_nueva);

        db.run(
            'UPDATE Users SET password_hash = ? WHERE id = ?',
            [newHash, userId],
            function (err) {
                if (err)
                    return res.status(500).json({ error: 'Error al actualizar la contraseña' });
                res.json({ message: 'Contraseña actualizada correctamente' });
            }
        );
    });
});

//Post claim-birthday
router.post('/claim-birthday', (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    db.get('SELECT birth_date FROM Users WHERE id = ?', [userId], (err, user) => {
        if (err)
            return res.status(500).json({ error: 'Error BD' });
        if (!user || !user.birth_date)
            return res.status(400).json({ error: 'Fecha de nacimiento no registrada' });

        const today = new Date();
        const birthday = new Date(user.birth_date);

        if (today.getMonth() !== birthday.getMonth() || today.getDate() !== birthday.getDate())
            return res.status(400).json({ error: 'Hoy no es tu cumpleaños' });

        const currentYear = today.getFullYear();

        db.get(
            `SELECT id FROM Point_transactions
             WHERE user_id = ? AND type = 'birthday_reward' AND strftime('%Y', created_at) = ?`,
            [userId, currentYear.toString()],
            (err, existingReward) => {
                if (err)
                    return res.status(500).json({ error: 'Error al comprobar recompensas' });
                if (existingReward)
                    return res.status(400).json({ error: 'Ya has reclamado tu recompensa de cumpleaños este año' });

                const BIRTHDAY_POINTS = 500;

                db.get('SELECT id FROM Wallet WHERE user_id = ?', [userId], (err, wallet) => {
                    if (err)
                        return res.status(500).json({ error: 'Error obteniendo wallet' });

                    const walletId = wallet ? wallet.id : null;

                    db.run(
                        `INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type)
                         VALUES (?, ?, ?, 'birthday_reward')`,
                        [userId, walletId, BIRTHDAY_POINTS],
                        function (err) {
                            if (err)
                                return res.status(500).json({ error: 'Error guardando transacción' });

                            db.run(
                                'UPDATE Wallet SET points = points + ? WHERE user_id = ?',
                                [BIRTHDAY_POINTS, userId],
                                (err) => {
                                    if (err)
                                        return res.status(500).json({ error: 'Error actualizando billetera' });
                                    res.json({ message: '¡Feliz Cumpleaños! Se han añadido 500 puntos a tu cartera.' });
                                }
                            );
                        }
                    );
                });
            }
        );
    });
});

module.exports = router;
