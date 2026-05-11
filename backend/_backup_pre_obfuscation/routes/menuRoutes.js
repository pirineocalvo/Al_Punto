const express = require('express');
const router = express.Router();
const db = require('../utils/db');

router.post('/', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const adminToken = req.headers.authorization.split(' ')[2];

    if (!token || !adminToken) {
        return res.status(401).json({ error: 'No se proporciono un token' });
    }
    const { name, ingredients, description, img_src, available, price, id_category } = req.body;
    const query = 'INSERT INTO Menu (name, ingredients, description, img_src, available, price, id_category) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.run(query, [name, ingredients, description, img_src, available, price, id_category], function(err) {
        if (err) {
            console.error('Error al insertar el plato:', err);
            res.status(500).json({ error: 'Error al insertar el plato' });
        } else {
            res.json({ id: this.lastID, message: 'Plato insertado correctamente' });
        }
    });
});

router.post('/addcategory', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const adminToken = req.headers.authorization.split(' ')[2];

    if (!token || !adminToken) {
        return res.status(401).json({ error: 'No se proporciono un token' });
    }
    const { name } = req.body;
    const query = 'INSERT INTO Menu_category (name) VALUES (?)';
    db.run(query, [name], function(err) {
        if (err) {
            console.error('Error al insertar la categoria:', err);
            res.status(500).json({ error: 'Error al insertar la categoria' });
        } else {
            res.json({ id: this.lastID, message: 'Categoria insertada correctamente' });
        }
    });
});

module.exports = router;
