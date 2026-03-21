const express = require('express');
const router = express.Router();
const { decrypt } = require('../utils/crypto');
const db = require('../utils/db')

router.get('/', (req, res) => {
    const query = 'SELECT Menu_category.name AS category_name, Menu.id_category, Menu.name, Menu.ingredients, Menu.description, Menu.img_src, Menu.available, Menu.price FROM Menu LEFT JOIN Menu_category ON Menu.id_category = Menu_category.id'
    db.all(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los platos:', err);
            res.status(500).json({ error: 'Error al obtener los platos' });
        } else {
            const arrPlatos = results.map(plato => ({
                name: plato.name,
                ingredients: plato.ingredients,
                description: plato.description,
                img_src: plato.img_src,
                available: plato.available,
                price: plato.price,
                id_category: plato.id_category
            }));
            res.json(arrPlatos);
        }
    });
})
router.get('/:idcategory', (req, res) => {
    const idcategory = req.params.idcategory;
    const query = 'SELECT Menu_category.name AS category_name, Menu.name, Menu.ingredients, Menu.description, Menu.img_src, Menu.available, Menu.price FROM Menu LEFT JOIN Menu_category ON Menu.id_category = Menu_category.id WHERE Menu.id_category = ?';
    db.all(query, [idcategory], (err, results) => {
        if (err) {
            console.error('Error al obtener los platos:', err);
            res.status(500).json({ error: 'Error al obtener los platos' });
        } else {
            res.json(results);
        }
    });
})
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
})
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
router.post('/update', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const adminToken = req.headers.authorization.split(' ')[2];

    if (!token || !adminToken) {
        return res.status(401).json({ error: 'No se proporciono un token' });
    }
    const { name, ingredients, description, img_src, available, price, id_category, id } = req.body;
    const query = 'UPDATE Menu SET name = ?, ingredients = ?, description = ?, img_src = ?, available = ?, price = ?, id_category = ? WHERE id = ?';
    db.run(query, [name, ingredients, description, img_src, available, price, id_category, id], function(err) {
        if (err) {
            console.error('Error al actualizar el plato:', err);
            res.status(500).json({ error: 'Error al actualizar el plato' });
        } else {
            res.json({ message: 'Plato actualizado correctamente', changes: this.changes });
        }
    });
});

module.exports = router;
