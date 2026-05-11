const express = require('express');
const router = express.Router();
const { authenticateWithLocal } = require('../middleware/auth');
const db = require('../utils/db');

// AÑADIR RESERVA
router.post('/addreserve', authenticateWithLocal, (req, res) => {
    const reserva = req.body;
    db.run('INSERT INTO Reservations (user_id, reserve_date, reserve_hour, guests) VALUES (?,?,?,?)',
        [req.localUserId, reserva.fecha, reserva.hora, reserva.comensales], function (err) {
            if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
            res.status(200).json({ message: 'Reserva realizada con exito', reservationId: this.lastID });
        });
});

// RESERVAS DEL USUARIO
router.get('/userReserve', authenticateWithLocal, (req, res) => {
    db.all(`
        SELECT r.*, mr.id_mesa, m.name as mesa_name, m.n_ocupantes as mesa_n_ocupantes
        FROM Reservations r
        LEFT JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
        LEFT JOIN Mesas m ON mr.id_mesa = m.id
        WHERE r.user_id = ?
        ORDER BY r.reserve_date DESC, r.reserve_hour DESC
    `, [req.localUserId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
        res.json(rows);
    });
});

// CANCELAR RESERVA
router.delete('/cancelar/:id', authenticateWithLocal, (req, res) => {
    const { id } = req.params;
    db.run('UPDATE Reservations SET status = "cancel" WHERE id = ? AND user_id = ?', [id, req.localUserId], function (err) {
        if (err) return res.status(500).json({ error: 'Error al consultar la base de datos' });
        if (this.changes === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
        res.status(200).json({ message: 'Reserva cancelada con exito' });
    });
});

module.exports = router;
