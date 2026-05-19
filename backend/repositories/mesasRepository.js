const db = require('../utils/db');

const query = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows))
);
const queryOne = (sql, params = []) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))
);
const run = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this) })
);

exports.getMesasActivas = () =>
    query('SELECT id FROM mesas WHERE activo = 1');

exports.getMesasActivasPorOcupantes = (ocupantes) => {
    if (!ocupantes)
        return query('SELECT id, nombre AS name, n_ocupantes FROM mesas WHERE activo = 1');
    const max = Number(ocupantes) + 2;
    return query(
        'SELECT id, nombre AS name, n_ocupantes FROM mesas WHERE activo = 1 AND n_ocupantes >= ? AND n_ocupantes <= ?',
        [Number(ocupantes), max]
    );
};

exports.getReservasPorMes = (year, month) =>
    query(
        `SELECT r.fecha_reserva AS reserve_date, r.hora_reserva AS reserve_hour, mr.id_mesa
         FROM reservas r
         JOIN mesas_reservadas mr ON mr.id_reserva = r.id
         WHERE strftime('%Y', r.fecha_reserva) = ?
           AND strftime('%m', r.fecha_reserva) = ?
           AND (r.estado IS NULL OR r.estado != 'cancel')`,
        [year, month]
    );

exports.getReservasPorFecha = (fecha) =>
    query(
        `SELECT r.hora_reserva AS reserve_hour, mr.id_mesa
         FROM reservas r
         JOIN mesas_reservadas mr ON mr.id_reserva = r.id
         WHERE r.fecha_reserva = ?
           AND (r.estado IS NULL OR r.estado != 'cancel')`,
        [fecha]
    );

exports.getReservaByIdAndUser = (idReserva, userId) =>
    queryOne(
        'SELECT id, fecha_reserva AS reserve_date, hora_reserva AS reserve_hour FROM reservas WHERE id = ? AND id_usuario = ?',
        [idReserva, userId]
    );

exports.getMesaActivaById = (idMesa) =>
    queryOne('SELECT id FROM mesas WHERE id = ? AND activo = 1', [idMesa]);

exports.getConflictoMesa = (idMesa, fecha, hora) =>
    queryOne(
        `SELECT mr.id
         FROM mesas_reservadas mr
         JOIN reservas r ON mr.id_reserva = r.id
         WHERE mr.id_mesa = ?
           AND r.fecha_reserva = ?
           AND r.hora_reserva = ?
           AND (r.estado IS NULL OR r.estado != 'cancel')`,
        [idMesa, fecha, hora]
    );

exports.insertMesaReservada = async (idReserva, idMesa) => {
    const result = await run(
        'INSERT INTO mesas_reservadas (id_reserva, id_mesa) VALUES (?, ?)',
        [idReserva, idMesa]
    );
    return result.lastID;
};

exports.getTodasMesas = () =>
    query('SELECT id, nombre AS name, n_ocupantes, activo FROM mesas ORDER BY activo DESC, id ASC');

exports.insertMesa = async (name, n_ocupantes) => {
    const result = await run(
        'INSERT INTO mesas (nombre, n_ocupantes, activo) VALUES (?, ?, 1)',
        [name, n_ocupantes]
    );
    return result.lastID;
};

exports.updateMesa = async (id, name, n_ocupantes, activo) => {
    const result = await run(
        'UPDATE mesas SET nombre = ?, n_ocupantes = ?, activo = ? WHERE id = ?',
        [name, n_ocupantes, activo, id]
    );
    return result.changes;
};

exports.desactivarMesa = async (id) => {
    const result = await run(
        'UPDATE mesas SET activo = 0 WHERE id = ?',
        [id]
    );
    return result.changes;
};