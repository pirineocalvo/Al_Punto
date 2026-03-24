const express = require('express');
const router = express.Router();
const { decrypt } = require('../utils/crypto');
const db = require('../utils/db');

// AÑADIR RESERVA
router.post('/addreserve', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }
    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId) {
        return res.status(401).json({ error: 'Token inválido' });
    }
    const reserva = req.body;
    
    db.run('INSERT INTO Reservations (user_id, reserve_date, reserve_hour, guests) VALUES (?,?,?,?)',
        [userId, reserva.fecha, reserva.hora, reserva.ocupantes], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error al consultar la base de datos' });
            }
            res.status(200).json({ id: this.lastID });
        });
});

// RESERVAS DEL USUARIO
router.get('/userReserve', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }
    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId) {
        return res.status(401).json({ error: 'Token inválido' });
    }
    db.all('SELECT * FROM Reservations WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(rows);
    });
});

//TODAS LAS RESERVAS
router.get('/allReserve', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }
    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId) {
        return res.status(401).json({ error: 'Token inválido' });
    }
    db.all('SELECT * FROM Reservations',(err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(rows);
    });
});


module.exports = router;
