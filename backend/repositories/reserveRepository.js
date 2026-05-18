const db = require('../utils/db');

const query = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows))
);
const run = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this) })
);

exports.insertReserva = async (userId, fecha, hora, comensales) => {
    const result = await run(
        'INSERT INTO Reservations (user_id, reserve_date, reserve_hour, guests) VALUES (?, ?, ?, ?)',
        [userId, fecha, hora, comensales]
    );
    return result.lastID;
};

exports.getReservasByUser = (userId) =>
    query(
        `SELECT r.*, mr.id_mesa, m.name AS mesa_name, m.n_ocupantes AS mesa_n_ocupantes
         FROM Reservations r
         LEFT JOIN Mesas_reservadas mr ON mr.id_reservas = r.id
         LEFT JOIN Mesas m             ON mr.id_mesa = m.id
         WHERE r.user_id = ?
         ORDER BY r.reserve_date DESC, r.reserve_hour DESC`,
        [userId]
    );

exports.cancelarReserva = async (reservaId, userId) => {
    const result = await run(
        'UPDATE Reservations SET status = "cancel" WHERE id = ? AND user_id = ?',
        [reservaId, userId]
    );
    return result.changes;
};

exports.getAllPendingReservas = () =>
    query(
        `SELECT r.id, r.reserve_date, r.reserve_hour, r.guests, r.attended, r.status, r.created_at,
                u.first_name || ' ' || u.last_name AS user_name,
                u.email                             AS user_email
         FROM Reservations r
         LEFT JOIN Users u ON r.user_id = u.id
         WHERE r.status IS NULL
         ORDER BY r.reserve_date DESC, r.reserve_hour DESC`
    );

exports.updateReservaStatus = async (reservaId, status, attended) => {
    const result = await run(
        'UPDATE Reservations SET status = ?, attended = ? WHERE id = ?',
        [status, attended, reservaId]
    );
    return result.changes;
};