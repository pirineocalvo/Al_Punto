const express = require('express');
const router  = express.Router();
const { getUserIdFromToken } = require('../utils/crypto');
const db = require('../utils/db');

//Middlewares 
const authMiddleware = (req, res, next) => {
    const userId = getUserIdFromToken(req, res);
    if (!userId) return;
    req.userId = userId;
    next();
};

const adminMiddleware = (req, res, next) => {
    db.get('SELECT access_level FROM Users WHERE id = ?', [req.userId], (err, user) => {
        if (err)
            return res.status(500).json({ error: 'Error de base de datos' });
        if (!user || user.access_level <= 3)
            return res.status(403).json({ error: 'Acceso denegado: se requiere nivel Staff/Admin' });
        next();
    });
};

// POST /addreserve
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

// GET /userReserve
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

// DELETE /cancelar/:id
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

//admin sacar todas las reservas que sean igual a NULL (sin gestionar)
router.get('/admin/allReserve', authMiddleware, adminMiddleware, (req, res) => {
    const query = `
        SELECT
            r.id,
            r.reserve_date,
            r.reserve_hour,
            r.guests,
            r.attended,
            r.status,
            r.created_at,
            u.first_name || ' ' || u.last_name AS user_name,
            u.email                             AS user_email
        FROM Reservations r
        LEFT JOIN Users u ON r.user_id = u.id
        WHERE r.status IS NULL
        ORDER BY r.reserve_date DESC, r.reserve_hour DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        res.json({ reservations: rows });
    });
});

//admin actualizar reserva
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, (req, res) => {
    const { id }     = req.params;
    const { status } = req.body;   // 'confirmed' | 'cancel'

    const attended = status === 'confirmed' ? 1 : 0;

    db.run(
        'UPDATE Reservations SET status = ?, attended = ? WHERE id = ?',
        [status, attended, id],
        function (err) {
            if (err)
                return res.status(500).json({ error: 'Error al actualizar la reserva' });
            if (this.changes === 0)
                return res.status(404).json({ error: 'Reserva no encontrada' });
            res.json({ message: `Reserva #${id} actualizada correctamente` });
        }
    );
});

module.exports = router;