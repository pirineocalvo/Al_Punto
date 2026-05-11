const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const db = require('../utils/db');
const { createNotification } = require('../utils/notifications');

// Todas las rutas de este router requieren admin
router.use(requireAdmin);

router.get('/charts/reservas-semana', (req, res) => {
    db.all(`SELECT date(reserve_date) as dia, COUNT(*) as total FROM Reservations WHERE reserve_date >= date('now', '-6 days') AND (status IS NULL OR status != 'cancel') GROUP BY dia ORDER BY dia ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener datos' });
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            result.push({ dia: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }), total: (rows.find(r => r.dia === key) || { total: 0 }).total });
        }
        res.json(result);
    });
});

router.get('/charts/pedidos-meses', (req, res) => {
    db.all(`SELECT strftime('%Y-%m', created_at) as mes, COUNT(*) as pedidos, SUM(total_price) as ingresos FROM Orders WHERE status != 'cancelado' AND created_at >= date('now', '-5 months', 'start of month') GROUP BY mes ORDER BY mes ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener datos' });
        const result = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const found = rows.find(r => r.mes === key);
            result.push({ mes: d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }), pedidos: found ? found.pedidos : 0, ingresos: found ? parseFloat(found.ingresos || 0).toFixed(2) : '0.00' });
        }
        res.json(result);
    });
});

router.get('/users', (req, res) => {
    db.all(`SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.access_level, u.created_at, w.points FROM Users u LEFT JOIN Wallet w ON u.id = w.user_id ORDER BY u.id DESC`, (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
        res.json(rows);
    });
});

router.get('/reservas', (req, res) => {
    db.all('SELECT r.*, u.first_name, u.last_name FROM Reservations r JOIN Users u ON r.user_id = u.id ORDER BY r.reserve_date DESC, r.reserve_hour DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener reservas' });
        res.json(rows);
    });
});

router.patch('/reservas/:id/attendance', (req, res) => {
    const statusStr = req.body.attended === 1 ? 'attended' : 'no-show';
    db.run('UPDATE Reservations SET status = ? WHERE id = ?', [statusStr, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: 'Error al actualizar asistencia' });
        res.json({ message: 'Asistencia actualizada' });
    });
});

router.patch('/reservas/:id/cancel', (req, res) => {
    const { id } = req.params;
    db.get('SELECT user_id FROM Reservations WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: 'Reserva no encontrada' });
        db.run('UPDATE Reservations SET status = "cancel" WHERE id = ?', [id], function (err) {
            if (err) return res.status(500).json({ error: 'Error al cancelar reserva' });
            if (this.changes === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
            createNotification(row.user_id, `❌ Tu reserva #${id} ha sido cancelada por el equipo. Disculpa las molestias.`, 'reserva');
            res.json({ message: 'Reserva cancelada correctamente' });
        });
    });
});

router.get('/resenias', (req, res) => {
    db.all(`SELECT r.id, r.descripcion, r.puntuacion, r.created_at, u.first_name, u.last_name, m.name as plato_name, m.img_src as plato_img FROM Resenias r LEFT JOIN Users u ON r.user_id = u.id LEFT JOIN Menu m ON r.id_plato = m.id ORDER BY r.created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener reseñas' });
        res.json(rows);
    });
});

module.exports = router;
