const db = require('../utils/db');

const consulta = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, filas) => err ? reject(err) : resolve(filas))
);
const ejecutar = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); })
);

exports.insertReserva = async (idUsuario, fecha, hora, comensales) => {
    const resultado = await ejecutar(
        'INSERT INTO reservas (id_usuario, fecha_reserva, hora_reserva, comensales) VALUES (?, ?, ?, ?)',
        [idUsuario, fecha, hora, comensales]
    );
    return resultado.lastID;
};

exports.getReservasByUser = (idUsuario) =>
    consulta(
        `SELECT r.id, r.fecha_reserva AS reserve_date, r.hora_reserva AS reserve_hour,
                r.comensales AS guests, r.atendido AS attended, r.estado AS status,
                r.creado_en AS created_at,
                mr.id_mesa, m.nombre AS mesa_name, m.n_ocupantes AS mesa_n_ocupantes
         FROM reservas r
         LEFT JOIN mesas_reservadas mr ON mr.id_reserva = r.id
         LEFT JOIN mesas m             ON mr.id_mesa = m.id
         WHERE r.id_usuario = ?
         ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC`,
        [idUsuario]
    );

exports.cancelarReserva = async (idReserva, idUsuario) => {
    const resultado = await ejecutar(
        'UPDATE reservas SET estado = "cancel" WHERE id = ? AND id_usuario = ?',
        [idReserva, idUsuario]
    );
    return resultado.changes;
};

exports.getAllPendingReservas = () =>
    consulta(
        `SELECT r.id, r.fecha_reserva AS reserve_date, r.hora_reserva AS reserve_hour,
                r.comensales AS guests, r.atendido AS attended, r.estado AS status,
                r.creado_en AS created_at,
                mr.id_mesa AS table_id,
                u.nombre || ' ' || u.apellido AS user_name,
                u.email                       AS user_email
         FROM reservas r
         LEFT JOIN usuarios u ON r.id_usuario = u.id
         LEFT JOIN mesas_reservadas mr ON mr.id_reserva = r.id
         WHERE r.estado IS NULL
         ORDER BY r.fecha_reserva DESC, r.hora_reserva DESC`
    );

exports.updateReservaStatus = async (idReserva, estado, atendido) => {
    const resultado = await ejecutar(
        'UPDATE reservas SET estado = ?, atendido = ? WHERE id = ?',
        [estado, atendido, idReserva]
    );
    return resultado.changes;
};