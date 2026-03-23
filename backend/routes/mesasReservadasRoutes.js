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
router.get('/disponibilidadMes', (req, res) => {
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

                    //revisa en las fechas las horas disponibles
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

router.get('/disponibilidadMesasDiaConcreto', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
    }

    const token = authHeader.split(' ')[1];
    const userId = decrypt(token);

    if (!userId) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    const { fecha } = req.query;
    const horario = ['13:30:00', '14:00:00', '14:30:00', '15:00:00'];
    const {ocupantes} = req.query;
    const asientosMax = Number(ocupantes) + 2
    if (!fecha) {
        return res.status(400).json({ error: 'Falta la fecha' });
    }

    let queryMesas = `SELECT id, name, n_ocupantes, activo FROM Mesas WHERE activo = 1`;
    const parametrosMesas = [];
    
    if (ocupantes) {
        queryMesas +=` AND n_ocupantes >= ? AND n_ocupantes <= ?`;
        parametrosMesas.push(ocupantes, asientosMax)
    }


    db.all(queryMesas, parametrosMesas,(errMesas, mesas) => {
            if (errMesas) {
                return res.status(500).json({ error: 'Error al consultar las mesas' });
            }

            db.all(
                `
                SELECT
                    r.reserve_hour,
                    mr.id_mesa
                FROM Reservations r
                JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
                WHERE r.reserve_date = ?
                AND r.status = 1
                `,
                [fecha],
                (errReservas, rows) => {
                    if (errReservas) {
                        return res.status(500).json({ error: 'Error al consultar las reservas' });
                    }

                    const horasOcupadasPorMesa = {};
                    //revusa kas horas disponibles
                    for (const row of rows) {
                        if (!horario.includes(row.reserve_hour)) continue;

                        if (!horasOcupadasPorMesa[row.id_mesa]) {
                            horasOcupadasPorMesa[row.id_mesa] = [];
                        }

                        if (!horasOcupadasPorMesa[row.id_mesa].includes(row.reserve_hour)) {
                            horasOcupadasPorMesa[row.id_mesa].push(row.reserve_hour);
                        }
                    }

                    const mesasDisponibles = mesas
                        .map((mesa) => {
                            const horasOcupadas = horasOcupadasPorMesa[mesa.id] || [];
                            const horasDisponibles = horario.filter(
                                (hora) => !horasOcupadas.includes(hora)
                            );

                            return {
                                id: mesa.id,
                                name: mesa.name,
                                n_ocupantes: mesa.n_ocupantes,
                                fecha,
                                horasDisponibles,
                                reservaBase: {
                                    user_id: userId,
                                    reserve_date: fecha,
                                    guests: null,
                                    reserve_hour: null,
                                    status: 1,
                                    attended: 0
                                }
                            };
                        })
                        .filter((mesa) => mesa.horasDisponibles.length > 0);

                    res.json(mesasDisponibles);
                }
            );
        }
    );
});
module.exports = router;