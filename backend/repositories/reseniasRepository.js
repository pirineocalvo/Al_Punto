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

exports.insertResenia = (id_plato, descripcion, puntuacion, userId) =>
    run(
        'INSERT INTO resenas (id_plato, descripcion, puntuacion, id_usuario) VALUES (?, ?, ?, ?)',
        [id_plato, descripcion, puntuacion, userId]
    );

exports.getWalletByUser = (userId) =>
    queryOne('SELECT id FROM monedero WHERE id_usuario = ?', [userId]);

exports.insertPointTransaction = (userId, walletId, amount) =>
    run(
        `INSERT INTO transacciones_puntos (id_usuario, id_monedero, cantidad_transaccion, tipo)
         VALUES (?, ?, ?, 'add resenia')`,
        [userId, walletId, amount]
    );

exports.addPoints = (userId, amount) =>
    run(
        'UPDATE monedero SET puntos = puntos + ? WHERE id_usuario = ?',
        [amount, userId]
    );

exports.getReviewsByUser = (userId) =>
    query(
        `SELECT r.*, m.nombre AS plato_name, m.img_src AS plato_img
         FROM resenas r
         LEFT JOIN menu m ON r.id_plato = m.id
         WHERE r.id_usuario = ?
         ORDER BY r.creado_en DESC`,
        [userId]
    );

exports.getReviewsByPlato = (id_plato) =>
    query(
        `SELECT r.*, u.nombre AS first_name, u.apellido AS last_name
         FROM resenas r
         LEFT JOIN usuarios u ON r.id_usuario = u.id
         WHERE r.id_plato = ?
         ORDER BY r.creado_en DESC`,
        [id_plato]
    );