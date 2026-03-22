const express = require('express');
const router = express.Router();
const { decrypt } = require('../utils/crypto');
const db = require('../utils/db');

// OBTENER TODAS LAS MESAS RESERVADAS
router.get('/allMesasReservadas', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }

    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);

    if (!userId) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    db.all('SELECT * FROM Mesas_reservadas', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }

        res.json(rows);
    });
});

// OBTENER DISPONIBILIDAD DEL MES
router.get('/disponibilidad-mes', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }

    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);

    if (!userId) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    const { year, month } = req.query;

    //es el mismo array que en Reservation.vue
    const horario = ['13:30:00', '14:00:00', '14:30:00', '15:00:00'];

    if (!year || !month) {
        return res.status(400).json({ error: 'Faltan year o month' });
    }

    db.all(
        `SELECT id, name FROM Mesas WHERE activo = 1`,
        [],
        (errMesas, mesas) => {
            if (errMesas) {
                return res.status(500).json({ error: 'Error al consultar las mesas' });
            }

            //strftime es una función de SQLite para extraer partes de una fecha.
            db.all(
                `SELECT
                    r.reserve_date,
                    r.reserve_hour,
                    mr.id_mesa
                FROM Reservations r
                JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
                WHERE strftime('%Y', r.reserve_date) = ?
                    AND strftime('%m', r.reserve_date) = ?
                    AND r.status = 1`,
                [String(year), String(month).padStart(2, '0')],
                (errReservas, rows) => {
                    if (errReservas) {
                        return res.status(500).json({ error: 'Error al consultar las reservas' });
                    }

                    const disponibilidad = {};
                    const mesasActivas = mesas.map((m) => m.id);

                    for (const row of rows) {
                        const fecha = row.reserve_date;
                        const mesaId = row.id_mesa;
                        const hora = row.reserve_hour;

                        if (!horario.includes(hora)) continue;

                        if (!disponibilidad[fecha]) {
                            disponibilidad[fecha] = {};
                        }

                        if (!disponibilidad[fecha][mesaId]) {
                            disponibilidad[fecha][mesaId] = [];
                        }

                        if (!disponibilidad[fecha][mesaId].includes(hora)) {
                            disponibilidad[fecha][mesaId].push(hora);
                        }
                    }

                    const diasBloqueados = {};

                    for (const fecha of Object.keys(disponibilidad)) {
                        const bloqueado = mesasActivas.every((mesaId) => {
                            const horasMesa = disponibilidad[fecha][mesaId] || [];
                            return horario.every((hora) => horasMesa.includes(hora));
                        });

                        diasBloqueados[fecha] = bloqueado;
                    }

                    res.json(diasBloqueados);
                }
            );
        }
    );
});

module.exports = router;