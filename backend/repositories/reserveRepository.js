const db = require('../utils/db');

const query = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows))
);
const run = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this) })
);

exports.insertReserva = async (userId, fecha, hora, comensales) => {
    const result = await run(
        'INSERT INTO reservas (id_usuario, fecha_reserva, hora_reserva, comensales) VALUES (?, ?, ?, ?)',
        [userId, fecha, hora, comensales]
    );
    return result.lastID;
};

exports.getReservasByUser = (userId) =>
    query(
        `SELECT r.id, r.fecha_reserva AS reserve_date, r.hora_reserva AS reserve_hour,
                r.comensales AS guests, r.atendido AS attended, r.estado AS status,
                r.creado_en AS created_at,
                mr.id_mesa, m.nombre AS mesa_name, m.n_ocupantes AS mesa_n_ocupantes
         FROM reservas r
         LEFT JOIN mesas_reservadas mr ON mr.id_reserva = r.id
         LEFT JOIN mesas m             ON mr.id_mesa = m.id
         WHERE r.id_usuario = ?
         ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC`,
        [userId]
    );

exports.cancelarReserva = async (reservaId, userId) => {
    const result = await run(
        'UPDATE reservas SET estado = "cancel" WHERE id = ? AND id_usuario = ?',
        [reservaId, userId]
    );
    return result.changes;
};

exports.getAllPendingReservas = () =>
    query(
        `SELECT r.id, r.fecha_reserva AS reserve_date, r.hora_reserva AS reserve_hour,
                r.comensales AS guests, r.atendido AS attended, r.estado AS status,
                r.creado_en AS created_at,
                u.nombre || ' ' || u.apellido AS user_name,
                u.email                       AS user_email
         FROM reservas r
         LEFT JOIN usuarios u ON r.id_usuario = u.id
         WHERE r.estado IS NULL
         ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC`
    );

exports.updateReservaStatus = async (reservaId, status, attended) => {
    const result = await run(
        'UPDATE reservas SET estado = ?, atendido = ? WHERE id = ?',
        [status, attended, reservaId]
    );
    return result.changes;
};