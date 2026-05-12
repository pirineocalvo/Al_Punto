const express = require('express');
const router  = express.Router();
const { decrypt } = require('../utils/crypto');
const db          = require('../utils/db');

//Constantes
const HORARIOS = [
    '13:30:00',
    '14:00:00',
    '14:30:00',
    '15:00:00',
    '15:30:00',
    '20:00:00',
    '20:30:00',
    '21:00:00',
    '21:30:00',
    '22:00:00',
    '22:30:00',
];

//Middlewares
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });

    const token  = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId)
        return res.status(401).json({ error: 'Token inválido' });

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

//GET /disponibilidad-mes
router.get('/disponibilidad-mes', authMiddleware, (req, res) => {
    const { year, month } = req.query;

    if (!year || !month)
        return res.status(400).json({ error: 'Faltan los parámetros year y month' });

    db.all('SELECT id FROM Mesas WHERE activo = 1', [], (err, mesas) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar las mesas' });
        if (!mesas.length)
            return res.json({});

        const query = `
            SELECT r.reserve_date, r.reserve_hour, mr.id_mesa
            FROM Reservations r
            JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
            WHERE strftime('%Y', r.reserve_date) = ?
              AND strftime('%m', r.reserve_date) = ?
              AND (r.status IS NULL OR r.status != 'cancel')
        `;

        db.all(query, [String(year), String(month).padStart(2, '0')], (err, reservas) => {
            if (err)
                return res.status(500).json({ error: 'Error al consultar las reservas' });

            // Construir mapa: { fecha: { idMesa: [horas ocupadas] } }
            const ocupacion = {};
            for (const reserva of reservas) {
                const { reserve_date: fecha, id_mesa, reserve_hour: hora } = reserva;
                if (!HORARIOS.includes(hora)) continue;
                if (!ocupacion[fecha])         ocupacion[fecha] = {};
                if (!ocupacion[fecha][id_mesa]) ocupacion[fecha][id_mesa] = [];
                if (!ocupacion[fecha][id_mesa].includes(hora))
                    ocupacion[fecha][id_mesa].push(hora);
            }

            // Para cada día, indicar si todas las mesas están llenas en todos los horarios
            const mesaIds = mesas.map(m => m.id);
            const disponibilidad = {};
            for (const fecha of Object.keys(ocupacion)) {
                disponibilidad[fecha] = mesaIds.every(id => {
                    const horasOcupadas = ocupacion[fecha][id] || [];
                    return HORARIOS.every(hora => horasOcupadas.includes(hora));
                });
            }

            res.json(disponibilidad);
        });
    });
});

//GET /disponibilidad-dia
router.get('/disponibilidad-dia', authMiddleware, (req, res) => {
    const { fecha, ocupantes } = req.query;

    if (!fecha)
        return res.status(400).json({ error: 'Falta el parámetro fecha' });

    let mesasQuery = 'SELECT id, name, n_ocupantes FROM Mesas WHERE activo = 1';
    const mesasParams = [];

    if (ocupantes) {
        const maxOcupantes = Number(ocupantes) + 2;
        mesasQuery += ' AND n_ocupantes >= ? AND n_ocupantes <= ?';
        mesasParams.push(Number(ocupantes), maxOcupantes);
    }

    db.all(mesasQuery, mesasParams, (err, mesas) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar las mesas' });

        const query = `
            SELECT r.reserve_hour, mr.id_mesa
            FROM Reservations r
            JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
            WHERE r.reserve_date = ?
              AND (r.status IS NULL OR r.status != 'cancel')
        `;

        db.all(query, [fecha], (err, reservas) => {
            if (err)
                return res.status(500).json({ error: 'Error al consultar las reservas' });

            // Construir mapa: { idMesa: [horas ocupadas] }
            const horasOcupadas = {};
            for (const reserva of reservas) {
                if (!HORARIOS.includes(reserva.reserve_hour)) continue;
                if (!horasOcupadas[reserva.id_mesa]) horasOcupadas[reserva.id_mesa] = [];
                if (!horasOcupadas[reserva.id_mesa].includes(reserva.reserve_hour))
                    horasOcupadas[reserva.id_mesa].push(reserva.reserve_hour);
            }

            const resultado = mesas
                .map(mesa => ({
                    id:               mesa.id,
                    name:             mesa.name,
                    n_ocupantes:      mesa.n_ocupantes,
                    horasDisponibles: HORARIOS.filter(hora => !(horasOcupadas[mesa.id] || []).includes(hora)),
                }))
                .filter(mesa => mesa.horasDisponibles.length > 0);

            res.json(resultado);
        });
    });
});

//POST /reservar
router.post('/reservar', authMiddleware, (req, res) => {
    const { idReserva, idMesa } = req.body;

    if (!idReserva || !idMesa)
        return res.status(400).json({ error: 'Faltan idReserva o idMesa' });

    db.get(
        'SELECT id, reserve_date, reserve_hour FROM Reservations WHERE id = ? AND user_id = ?',
        [idReserva, req.userId],
        (err, reserva) => {
            if (err)  return res.status(500).json({ error: 'Error de base de datos' });
            if (!reserva) return res.status(404).json({ error: 'Reserva no encontrada o no pertenece al usuario' });

            db.get(
                'SELECT id FROM Mesas WHERE id = ? AND activo = 1',
                [idMesa],
                (err, mesa) => {
                    if (err)   return res.status(500).json({ error: 'Error de base de datos' });
                    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada o inactiva' });

                    const conflictoQuery = `
                        SELECT mr.id
                        FROM Mesas_reservadas mr
                        JOIN Reservations r ON mr.id_reservas = r.id
                        WHERE mr.id_mesa = ?
                          AND r.reserve_date = ?
                          AND r.reserve_hour = ?
                          AND (r.status IS NULL OR r.status != 'cancel')
                    `;

                    db.get(conflictoQuery, [idMesa, reserva.reserve_date, reserva.reserve_hour], (err, conflicto) => {
                        if (err)       return res.status(500).json({ error: 'Error de base de datos' });
                        if (conflicto) return res.status(409).json({ error: 'Esa mesa ya está reservada para esa fecha y hora. Por favor elige otra.' });

                        db.run(
                            'INSERT INTO Mesas_reservadas (id_reservas, id_mesa) VALUES (?, ?)',
                            [idReserva, idMesa],
                            function (err) {
                                if (err)
                                    return res.status(500).json({ error: 'Error al vincular la mesa' });
                                res.json({ message: 'Mesa vinculada correctamente', id: this.lastID });
                            }
                        );
                    });
                }
            );
        }
    );
});

//GET /admin/todas
router.get('/admin/todas', authMiddleware, adminMiddleware, (req, res) => {
    db.all('SELECT * FROM Mesas ORDER BY activo DESC, id ASC', [], (err, mesas) => {
        if (err)
            return res.status(500).json({ error: 'Error al consultar las mesas' });
        res.json(mesas);
    });
});

//POST /admin/crear
router.post('/admin/crear', authMiddleware, adminMiddleware, (req, res) => {
    const { name, n_ocupantes } = req.body;

    if (!name || !n_ocupantes)
        return res.status(400).json({ error: 'Faltan name o n_ocupantes' });

    db.run(
        'INSERT INTO Mesas (name, n_ocupantes, activo) VALUES (?, ?, 1)',
        [name, Number(n_ocupantes)],
        function (err) {
            if (err)
                return res.status(500).json({ error: 'Error al crear la mesa' });
            res.json({ message: 'Mesa creada correctamente', id: this.lastID });
        }
    );
});

//PUT /admin/:id
router.put('/admin/:id', authMiddleware, adminMiddleware, (req, res) => {
    const { name, n_ocupantes, activo } = req.body;
    const { id } = req.params;

    db.run(
        'UPDATE Mesas SET name = ?, n_ocupantes = ?, activo = ? WHERE id = ?',
        [name, Number(n_ocupantes), activo ? 1 : 0, id],
        function (err) {
            if (err)
                return res.status(500).json({ error: 'Error al actualizar la mesa' });
            if (this.changes === 0)
                return res.status(404).json({ error: 'Mesa no encontrada' });
            res.json({ message: 'Mesa actualizada correctamente' });
        }
    );
});

//DELETE /admin/:id
router.delete('/admin/:id', authMiddleware, adminMiddleware, (req, res) => {
    const { id } = req.params;

    db.run('UPDATE Mesas SET activo = 0 WHERE id = ?', [id], function (err) {
        if (err)
            return res.status(500).json({ error: 'Error al desactivar la mesa' });
        if (this.changes === 0)
            return res.status(404).json({ error: 'Mesa no encontrada' });
        res.json({ message: 'Mesa desactivada correctamente' });
    });
});

module.exports = router;
