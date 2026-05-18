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
    query('SELECT id FROM Mesas WHERE activo = 1');

exports.getMesasActivasPorOcupantes = (ocupantes) => {
    if (!ocupantes)
        return query('SELECT id, name, n_ocupantes FROM Mesas WHERE activo = 1');
    const max = Number(ocupantes) + 2;
    return query(
        'SELECT id, name, n_ocupantes FROM Mesas WHERE activo = 1 AND n_ocupantes >= ? AND n_ocupantes <= ?',
        [Number(ocupantes), max]
    );
};

exports.getReservasPorMes = (year, month) =>
    query(
        `SELECT r.reserve_date, r.reserve_hour, mr.id_mesa
         FROM Reservations r
         JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
         WHERE strftime('%Y', r.reserve_date) = ?
           AND strftime('%m', r.reserve_date) = ?
           AND (r.status IS NULL OR r.status != 'cancel')`,
        [year, month]
    );

exports.getReservasPorFecha = (fecha) =>
    query(
        `SELECT r.reserve_hour, mr.id_mesa
         FROM Reservations r
         JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
         WHERE r.reserve_date = ?
           AND (r.status IS NULL OR r.status != 'cancel')`,
        [fecha]
    );

exports.getReservaByIdAndUser = (idReserva, userId) =>
    queryOne(
        'SELECT id, reserve_date, reserve_hour FROM Reservations WHERE id = ? AND user_id = ?',
        [idReserva, userId]
    );

exports.getMesaActivaById = (idMesa) =>
    queryOne('SELECT id FROM Mesas WHERE id = ? AND activo = 1', [idMesa]);

exports.getConflictoMesa = (idMesa, fecha, hora) =>
    queryOne(
        `SELECT mr.id
         FROM Mesas_reservadas mr
         JOIN Reservations r ON mr.id_reservas = r.id
         WHERE mr.id_mesa = ?
           AND r.reserve_date = ?
           AND r.reserve_hour = ?
           AND (r.status IS NULL OR r.status != 'cancel')`,
        [idMesa, fecha, hora]
    );

exports.insertMesaReservada = async (idReserva, idMesa) => {
    const result = await run(
        'INSERT INTO Mesas_reservadas (id_reservas, id_mesa) VALUES (?, ?)',
        [idReserva, idMesa]
    );
    return result.lastID;
};

exports.getTodasMesas = () =>
    query('SELECT * FROM Mesas ORDER BY activo DESC, id ASC');

exports.insertMesa = async (name, n_ocupantes) => {
    const result = await run(
        'INSERT INTO Mesas (name, n_ocupantes, activo) VALUES (?, ?, 1)',
        [name, n_ocupantes]
    );
    return result.lastID;
};

exports.updateMesa = async (id, name, n_ocupantes, activo) => {
    const result = await run(
        'UPDATE Mesas SET name = ?, n_ocupantes = ?, activo = ? WHERE id = ?',
        [name, n_ocupantes, activo, id]
    );
    return result.changes;
};

exports.desactivarMesa = async (id) => {
    const result = await run(
        'UPDATE Mesas SET activo = 0 WHERE id = ?',
        [id]
    );
    return result.changes;
};