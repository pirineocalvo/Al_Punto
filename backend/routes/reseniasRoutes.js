const express = require('express');
const router  = express.Router();
const { decrypt } = require('../utils/crypto');
const db          = require('../utils/db');

function getTokenUserId(req, res) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
        return null;
    }
    const token  = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId) {
        res.status(401).json({ error: 'Token inválido' });
        return null;
    }
    return userId;
}

//Post reseña
router.post('/', (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    const { id_plato, descripcion, puntuacion } = req.body;

    if (!id_plato || puntuacion == null || !descripcion)
        return res.status(400).json({ error: 'Datos de la reseña incompletos' });

    const REVIEW_POINTS = 5;

    db.run(
        'INSERT INTO Resenias (id_plato, descripcion, puntuacion, user_id) VALUES (?, ?, ?, ?)',
        [id_plato, descripcion, puntuacion, userId],
        function (err) {
            if (err) {
                console.error('Error insertando reseña:', err);
                return res.status(500).json({ error: 'Error al insertar la reseña' });
            }

            db.get('SELECT id FROM Wallet WHERE user_id = ?', [userId], (err, wallet) => {
                const walletId = wallet?.id ?? null;

                db.run(
                    `INSERT INTO Point_transactions (user_id, wallet_id, amount_transaction, type)
                     VALUES (?, ?, ?, 'add resenia')`,
                    [userId, walletId, REVIEW_POINTS],
                    (err) => {
                        if (err) console.error(err);

                        db.run(
                            'UPDATE Wallet SET points = points + ? WHERE user_id = ?',
                            [REVIEW_POINTS, userId],
                            (err) => {
                                if (err) console.error(err);

                                res.json({
                                    message: 'Reseña añadida correctamente',
                                    reward:  `¡Gracias! Has ganado ${REVIEW_POINTS} puntos por tu reseña.`,
                                });
                            }
                        );
                    }
                );
            });
        }
    );
});

//GET /my-reviews
router.get('/my-reviews', (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;

    const query = `
        SELECT r.*, m.name AS plato_name, m.img_src AS plato_img
        FROM Resenias r
        LEFT JOIN Menu m ON r.id_plato = m.id
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err)
            return res.status(500).json({ error: 'Error obteniendo tus reseñas' });
        res.json(rows);
    });
});

//GET /:id_plato
router.get('/:id_plato', (req, res) => {
    const { id_plato } = req.params;

    const query = `
        SELECT r.*, u.first_name, u.last_name
        FROM Resenias r
        LEFT JOIN Users u ON r.user_id = u.id
        WHERE r.id_plato = ?
        ORDER BY r.created_at DESC
    `;

    db.all(query, [id_plato], (err, rows) => {
        if (err)
            return res.status(500).json({ error: 'Error obteniendo reseñas' });
        res.json(rows);
    });
});

module.exports = router;
