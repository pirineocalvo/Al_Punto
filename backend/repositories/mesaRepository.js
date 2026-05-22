const db = require('../utils/db');

const consulta = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, filas) => err ? reject(err) : resolve(filas))
);
const consultaUno = (sql, params = []) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, fila) => err ? reject(err) : resolve(fila))
);
const ejecutar = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); })
);

exports.getMesasActivas = () =>
    consulta('SELECT id FROM mesas WHERE activo = 1');

exports.getMesasActivasPorOcupantes = (ocupantes) => {
    if (!ocupantes) {
        return consulta('SELECT id, nombre AS name, n_ocupantes FROM mesas WHERE activo = 1');
    }
    const maximo = Number(ocupantes) + 2;
    return consulta(
        'SELECT id, nombre AS name, n_ocupantes FROM mesas WHERE activo = 1 AND n_ocupantes >= ? AND n_ocupantes <= ?',
        [Number(ocupantes), maximo]
    );
};

exports.getReservasPorMes = (anio, mes) =>
    consulta(
        `SELECT r.fecha_reserva AS reserve_date, r.hora_reserva AS reserve_hour, mr.id_mesa
         FROM reservas r
         JOIN mesas_reservadas mr ON mr.id_reserva = r.id
         WHERE strftime('%Y', r.fecha_reserva) = ?
           AND strftime('%m', r.fecha_reserva) = ?
           AND (r.estado IS NULL OR r.estado != 'cancel')`,
        [anio, mes]
    );

exports.getReservasPorFecha = (fecha) =>
    consulta(
        `SELECT r.hora_reserva AS reserve_hour, mr.id_mesa
         FROM reservas r
         JOIN mesas_reservadas mr ON mr.id_reserva = r.id
         WHERE r.fecha_reserva = ?
           AND (r.estado IS NULL OR r.estado != 'cancel')`,
        [fecha]
    );

exports.getReservaByIdAndUser = (idReserva, idUsuario) =>
    consultaUno(
        'SELECT id, fecha_reserva AS reserve_date, hora_reserva AS reserve_hour FROM reservas WHERE id = ? AND id_usuario = ?',
        [idReserva, idUsuario]
    );

exports.getMesaActivaById = (idMesa) =>
    consultaUno('SELECT id FROM mesas WHERE id = ? AND activo = 1', [idMesa]);

exports.getConflictoMesa = (idMesa, fecha, hora) =>
    consultaUno(
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
    const resultado = await ejecutar(
        'INSERT INTO mesas_reservadas (id_reserva, id_mesa) VALUES (?, ?)',
        [idReserva, idMesa]
    );
    return resultado.lastID;
};

exports.getTodasMesas = () =>
    consulta('SELECT id, nombre AS name, n_ocupantes, activo FROM mesas ORDER BY activo DESC, id ASC');

exports.insertMesa = async (name, nOcupantes) => {
    const resultado = await ejecutar(
        'INSERT INTO mesas (nombre, n_ocupantes, activo) VALUES (?, ?, 1)',
        [name, nOcupantes]
    );
    return resultado.lastID;
};

exports.updateMesa = async (id, name, nOcupantes, activo) => {
    const resultado = await ejecutar(
        'UPDATE mesas SET nombre = ?, n_ocupantes = ?, activo = ? WHERE id = ?',
        [name, nOcupantes, activo, id]
    );
    return resultado.changes;
};

exports.desactivarMesa = async (id) => {
    const resultado = await ejecutar(
        'UPDATE mesas SET activo = 0 WHERE id = ?',
        [id]
    );
    return resultado.changes;
};