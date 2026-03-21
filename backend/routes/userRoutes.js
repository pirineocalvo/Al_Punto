const express = require('express');
const router = express.Router();
const { encrypt, decrypt, hashPassword, comparePassword } = require('../utils/crypto');
const db = require('../utils/db')

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM Users WHERE email = ?', [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        if (!row) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        const passwordHash = row.password_hash;
        const passwordMatch = comparePassword(password, passwordHash);
        if (!passwordMatch) {
            db.run('INSERT INTO login_log (user_id, success, ip_address) VALUES (?, ?, ?)', [row.id, false, req.ip]);
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        } else {
            db.run('INSERT INTO login_log (user_id, success, ip_address) VALUES (?, ?, ?)', [row.id, true, req.ip]);
        }
        const token = encrypt(row.id);
        const userInfo = {
            first_name: row.first_name,
            last_name: row.last_name,
            phone: row.phone,
            email: row.email
        }

        res.json({ token: token, userInfo: userInfo });
    });
});

router.post('/register', (req, res) => {
    const { firstName, lastName, phone, email, password } = req.body;
    db.get('SELECT id FROM Users WHERE email = ?', [email], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        if (row) {
            return res.status(401).json({ error: 'Usuario ya registrado' });
        }
        const passwordHash = hashPassword(password);
        const query = `INSERT INTO Users (first_name, last_name, phone, email, password_hash) VALUES (?, ?, ?, ?, ?)`
        db.run(query, [firstName, lastName, phone, email, passwordHash], function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error al registrar el usuario' });
            }
            const userId = this.lastID;
            const queryWallet = "INSERT INTO Wallet (user_id, points) VALUES (?, ?)";
            db.run(queryWallet, [userId, 500], (err) => {
                if (err) {
                    console.error('Error al crear la billetera:', err);
                }
                res.json({ message: 'Usuario registrado correctamente' });
            });
        });
    });
});

router.get('/userInfo', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }
    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId) {
        return res.status(401).json({ error: 'Token inválido' });
    }
    const query = `
        SELECT Users.first_name, Users.last_name, Users.phone, Users.email, Wallet.points, Users.access_level,
        (SELECT name FROM Levels WHERE Wallet.points > min_points AND Wallet.points < max_points) AS levelName,
        (SELECT hex_bkg FROM Levels WHERE Wallet.points > min_points AND Wallet.points < max_points) AS levelBkg,
        (SELECT hex_text FROM Levels WHERE Wallet.points > min_points AND Wallet.points < max_points) AS levelText,
        (SELECT COUNT(*) FROM Tickets WHERE user_id = Users.id) AS ticket_count
        FROM Users 
        LEFT JOIN Wallet ON Users.id = Wallet.user_id 
        WHERE Users.id = ?
    `;
    db.get(query, [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }

        res.json(row);
    });
});

module.exports = router;
