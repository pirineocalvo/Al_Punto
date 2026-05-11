const express = require('express');
const router = express.Router();
const { authenticateWithLocal, requireAdmin } = require('../middleware/auth');
const db = require('../utils/db');

const HORARIOS = [
    '13:30:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00',
    '20:00:00', '20:30:00', '21:00:00', '21:30:00', '22:00:00', '22:30:00'
];

// GET /api/mesas/disponibilidad-mes
router.get('/disponibilidad-mes', authenticateWithLocal, (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ error: 'Faltan los parámetros year y month' });

    db.all('SELECT id FROM Mesas WHERE activo = 1', [], (errMesas, mesas) => {
        if (errMesas) return res.status(500).json({ error: 'Error al consultar las mesas' });
        if (!mesas.length) return res.json({});

        db.all(`
            SELECT r.reserve_date, r.reserve_hour, mr.id_mesa
            FROM Reservations r
            JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
            WHERE strftime('%Y', r.reserve_date) = ?
              AND strftime('%m', r.reserve_date) = ?
              AND (r.status IS NULL OR r.status != 'cancel')
        `, [String(year), String(month).padStart(2, '0')], (errReservas, rows) => {
            if (errReservas) return res.status(500).json({ error: 'Error al consultar las reservas' });

            const ocupacion = {};
            const mesasActivas = mesas.map(m => m.id);
            for (const row of rows) {
                if (!HORARIOS.includes(row.reserve_hour)) continue;
                if (!ocupacion[row.reserve_date]) ocupacion[row.reserve_date] = {};
                if (!ocupacion[row.reserve_date][row.id_mesa]) ocupacion[row.reserve_date][row.id_mesa] = [];
                if (!ocupacion[row.reserve_date][row.id_mesa].includes(row.reserve_hour)) {
                    ocupacion[row.reserve_date][row.id_mesa].push(row.reserve_hour);
                }
            }

            const diasBloqueados = {};
            for (const fecha of Object.keys(ocupacion)) {
                diasBloqueados[fecha] = mesasActivas.every(mesaId => {
                    const horasMesa = ocupacion[fecha][mesaId] || [];
                    return HORARIOS.every(hora => horasMesa.includes(hora));
                });
            }
            res.json(diasBloqueados);
        });
    });
});

// GET /api/mesas/disponibilidad-dia
router.get('/disponibilidad-dia', authenticateWithLocal, (req, res) => {
    const { fecha, ocupantes } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Falta el parámetro fecha' });

    let queryMesas = 'SELECT id, name, n_ocupantes FROM Mesas WHERE activo = 1';
    const params = [];
    if (ocupantes) {
        queryMesas += ' AND n_ocupantes >= ? AND n_ocupantes <= ?';
        params.push(Number(ocupantes), Number(ocupantes) + 2);
    }

    db.all(queryMesas, params, (errMesas, mesas) => {
        if (errMesas) return res.status(500).json({ error: 'Error al consultar las mesas' });

        db.all(`
            SELECT r.reserve_hour, mr.id_mesa
            FROM Reservations r
            JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
            WHERE r.reserve_date = ? AND (r.status IS NULL OR r.status != 'cancel')
        `, [fecha], (errReservas, rows) => {
            if (errReservas) return res.status(500).json({ error: 'Error al consultar las reservas' });

            const horasOcupadas = {};
            for (const row of rows) {
                if (!HORARIOS.includes(row.reserve_hour)) continue;
                if (!horasOcupadas[row.id_mesa]) horasOcupadas[row.id_mesa] = [];
                if (!horasOcupadas[row.id_mesa].includes(row.reserve_hour)) horasOcupadas[row.id_mesa].push(row.reserve_hour);
            }

            const resultado = mesas
                .map(mesa => ({ id: mesa.id, name: mesa.name, n_ocupantes: mesa.n_ocupantes, horasDisponibles: HORARIOS.filter(h => !(horasOcupadas[mesa.id] || []).includes(h)) }))
                .filter(mesa => mesa.horasDisponibles.length > 0);
            res.json(resultado);
        });
    });
});

// POST /api/mesas/reservar
router.post('/reservar', authenticateWithLocal, (req, res) => {
    const { idReserva, idMesa } = req.body;
    if (!idReserva || !idMesa) return res.status(400).json({ error: 'Faltan idReserva o idMesa' });

    db.get('SELECT id, reserve_date, reserve_hour FROM Reservations WHERE id = ? AND user_id = ?', [idReserva, req.localUserId], (err, reserva) => {
        if (err) return res.status(500).json({ error: 'Error de base de datos' });
        if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada o no pertenece al usuario' });

        db.get('SELECT id FROM Mesas WHERE id = ? AND activo = 1', [idMesa], (err, mesa) => {
            if (err) return res.status(500).json({ error: 'Error de base de datos' });
            if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada o inactiva' });

            db.get(`
                SELECT mr.id FROM Mesas_reservadas mr
                JOIN Reservations r ON mr.id_reservas = r.id
                WHERE mr.id_mesa = ? AND r.reserve_date = ? AND r.reserve_hour = ?
                  AND (r.status IS NULL OR r.status != 'cancel')
            `, [idMesa, reserva.reserve_date, reserva.reserve_hour], (err, ocupada) => {
                if (err) return res.status(500).json({ error: 'Error de base de datos' });
                if (ocupada) return res.status(409).json({ error: 'Esa mesa ya está reservada para esa fecha y hora. Por favor elige otra.' });

                db.run('INSERT INTO Mesas_reservadas (id_reservas, id_mesa) VALUES (?, ?)', [idReserva, idMesa], function (err) {
                    if (err) return res.status(500).json({ error: 'Error al vincular la mesa' });
                    res.json({ message: 'Mesa vinculada correctamente', id: this.lastID });
                });
            });
        });
    });
});

// ── Admin ─────────────────────────────────────────────────────────────────────

router.get('/admin/todas', requireAdmin, (req, res) => {
    db.all('SELECT * FROM Mesas ORDER BY activo DESC, id ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al consultar las mesas' });
        res.json(rows);
    });
});

router.put('/admin/:id', requireAdmin, (req, res) => {
    const { name, n_ocupantes, activo } = req.body;
    db.run('UPDATE Mesas SET name = ?, n_ocupantes = ?, activo = ? WHERE id = ?', [name, Number(n_ocupantes), activo ? 1 : 0, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: 'Error al actualizar la mesa' });
        if (this.changes === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
        res.json({ message: 'Mesa actualizada correctamente' });
    });
});

module.exports = router;
