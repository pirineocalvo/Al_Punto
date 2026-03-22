const express = require('express');
const router = express.Router();
const { decrypt } = require('../utils/crypto');
const db = require('../utils/db')

// OBTENER TODAS LAS MESAS

router.get('/allTable', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }
    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId) {
        return res.status(401).json({ error: 'Token inválido' });
    }
    db.all('SELECT * FROM Mesas',(err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(rows);
    });
});

module.exports = router;