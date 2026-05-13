const express = require('express');
const router  = express.Router();
const { getUserIdFromToken } = require('../utils/crypto');
const db          = require('../utils/db');

//Post addReserve
router.post('/addreserve', (req, res) => {
    const userId = getUserIdFromToken(req, res);
    if (!userId) return;

    const { fecha, hora, comensales } = req.body;

    db.run(
        'INSERT INTO Reservations (user_id, reserve_date, reserve_hour, guests) VALUES (?, ?, ?, ?)',
        [userId, fecha, hora, comensales],
        function (err) {
            if (err)
                return res.status(500).json({ error: 'Error al consultar la base de datos' });
            res.status(200).json({
                message:       'Reserva realizada con exito',
                reservationId: this.lastID,
            });
        }
    );
});

//Get userReserve
router.get('/userReserve', (req, res) => {
    const userId = getUserIdFromToken(req, res);
    if (!userId) return;

    const query = `
        SELECT r.*, mr.id_mesa, m.name AS mesa_name, m.n_ocupantes AS mesa_n_ocupantes
        FROM Reservations r
        LEFT JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
        LEFT JOIN Mesas m ON mr.id_mesa = m.id
        WHERE r.user_id = ?
        ORDER BY r.reserve_date DESC, r.reserve_hour DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        res.json(rows);
    });
});

//DELETE /cancelar/:id
router.delete('/cancelar/:id', (req, res) => {
    const userId = getUserIdFromToken(req, res);
    if (!userId) return;

    const { id } = req.params;

    db.run(
        'UPDATE Reservations SET status = "cancel" WHERE id = ? AND user_id = ?',
        [id, userId],
        function (err) {
            if (err)
                return res.status(500).json({ error: 'Error al consultar la base de datos' });
            if (this.changes === 0)
                return res.status(404).json({ error: 'Reserva no encontrada' });
            res.status(200).json({ message: 'Reserva cancelada con exito' });
        }
    );
});

module.exports = router;