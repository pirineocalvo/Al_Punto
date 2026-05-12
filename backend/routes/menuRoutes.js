const express = require('express');
const router  = express.Router();
const { decrypt } = require('../utils/crypto');
const db          = require('../utils/db');

//GET / 
router.get('/', (req, res) => {
    const query = `
        SELECT Menu.id, Menu_category.name AS category_name, Menu.id_category,
               Menu.name, Menu.ingredients, Menu.description,
               Menu.img_src, Menu.available, Menu.price
        FROM Menu
        LEFT JOIN Menu_category ON Menu.id_category = Menu_category.id
    `;

    db.all(query, (err, rows) => {
        if (err) {
            console.error('Error al obtener los platos:', err);
            return res.status(500).json({ error: 'Error al obtener los platos' });
        }
        res.json(rows);
    });
});

//GET /categorias
router.get('/categorias', (req, res) => {
    db.all('SELECT * FROM Menu_category ORDER BY id', (err, rows) => {
        if (err)
            return res.status(500).json({ error: 'Error al obtener categorías' });
        res.json(rows);
    });
});

//GET /:idcategory
router.get('/:idcategory', (req, res) => {
    const { idcategory } = req.params;

    const query = `
        SELECT Menu.id, Menu_category.name AS category_name,
               Menu.name, Menu.ingredients, Menu.description,
               Menu.img_src, Menu.available, Menu.price
        FROM Menu
        LEFT JOIN Menu_category ON Menu.id_category = Menu_category.id
        WHERE Menu.id_category = ?
    `;

    db.all(query, [idcategory], (err, rows) => {
        if (err) {
            console.error('Error al obtener los platos:', err);
            return res.status(500).json({ error: 'Error al obtener los platos' });
        }
        res.json(rows);
    });
});

//POST /
router.post('/', (req, res) => {
    const parts = req.headers['authorization']?.split(' ');
    if (!parts?.[1] || !parts?.[2])
        return res.status(401).json({ error: 'No se proporcionó un token' });

    const { name, ingredients, description, img_src, available, price, id_category } = req.body;

    db.run(
        `INSERT INTO Menu (name, ingredients, description, img_src, available, price, id_category)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, ingredients, description, img_src, available, price, id_category],
        function (err) {
            if (err) {
                console.error('Error al insertar el plato:', err);
                return res.status(500).json({ error: 'Error al insertar el plato' });
            }
            res.json({ id: this.lastID, message: 'Plato insertado correctamente' });
        }
    );
});

//POST /addcategory
router.post('/addcategory', (req, res) => {
    const parts = req.headers['authorization']?.split(' ');
    if (!parts?.[1] || !parts?.[2])
        return res.status(401).json({ error: 'No se proporcionó un token' });

    const { name } = req.body;

    db.run('INSERT INTO Menu_category (name) VALUES (?)', [name], function (err) {
        if (err) {
            console.error('Error al insertar la categoria:', err);
            return res.status(500).json({ error: 'Error al insertar la categoria' });
        }
        res.json({ id: this.lastID, message: 'Categoria insertada correctamente' });
    });
});

//POST /update
router.post('/update', (req, res) => {
    const parts = req.headers['authorization']?.split(' ');
    if (!parts?.[1] || !parts?.[2])
        return res.status(401).json({ error: 'No se proporcionó un token' });

    const { name, ingredients, description, img_src, available, price, id_category, id } = req.body;

    db.run(
        `UPDATE Menu
         SET name = ?, ingredients = ?, description = ?, img_src = ?,
             available = ?, price = ?, id_category = ?
         WHERE id = ?`,
        [name, ingredients, description, img_src, available, price, id_category, id],
        function (err) {
            if (err) {
                console.error('Error al actualizar el plato:', err);
                return res.status(500).json({ error: 'Error al actualizar el plato' });
            }
            res.json({ message: 'Plato actualizado correctamente', changes: this.changes });
        }
    );
});

module.exports = router;
