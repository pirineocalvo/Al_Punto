const express = require('express');
const router = express.Router();
const { authenticateWithLocal } = require('../middleware/auth');
const db = require('../utils/db');

// Añadir reseña
router.post('/', authenticateWithLocal, (req, res) => {
    const { id_plato, descripcion, puntuacion } = req.body;
    if (!id_plato || puntuacion == null || !descripcion) {
        return res.status(400).json({ error: 'Datos de la reseña incompletos' });
    }

    const userId = req.localUserId;
    db.run('INSERT INTO Resenias (id_plato, descripcion, puntuacion, user_id) VALUES (?, ?, ?, ?)', [id_plato, descripcion, puntuacion, userId], function (err) {
        if (err) return res.status(500).json({ error: 'Error al insertar la reseña' });

        const rewardPoints = 5;
        db.get('SELECT id FROM Wallet WHERE user_id = ?', [userId], (err, wallet) => {
            const walletId = wallet?.id || null;
            db.run("INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type) VALUES (?, ?, ?, 'add resenia')", [userId, walletId, rewardPoints], (err) => {
                if (err) console.error(err);
                db.run('UPDATE Wallet SET points = points + ? WHERE user_id = ?', [rewardPoints, userId], (err) => {
                    if (err) console.error(err);
                    res.json({ message: 'Reseña añadida correctamente', reward: `¡Gracias! Has ganado ${rewardPoints} puntos por tu reseña.` });
                });
            });
        });
    });
});

// Reseñas del usuario
router.get('/my-reviews', authenticateWithLocal, (req, res) => {
    db.all(
        'SELECT r.*, m.name as plato_name, m.img_src as plato_img FROM Resenias r LEFT JOIN Menu m ON r.id_plato = m.id WHERE r.user_id = ? ORDER BY r.created_at DESC',
        [req.localUserId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error obteniendo tus reseñas' });
            res.json(rows);
        }
    );
});

// Reseñas por plato (pública)
router.get('/:id_plato', (req, res) => {
    db.all(
        'SELECT r.*, u.first_name, u.last_name FROM Resenias r LEFT JOIN Users u ON r.user_id = u.id WHERE r.id_plato = ? ORDER BY r.created_at DESC',
        [req.params.id_plato],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Error obteniendo reseñas' });
            res.json(rows);
        }
    );
});

module.exports = router;
