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

exports.insertResenia = (id_plato, descripcion, puntuacion, idUsuario) =>
    ejecutar(
        'INSERT INTO resenas (id_plato, descripcion, puntuacion, id_usuario) VALUES (?, ?, ?, ?)',
        [id_plato, descripcion, puntuacion, idUsuario]
    );

exports.getWalletByUser = (idUsuario) =>
    consultaUno('SELECT id FROM monedero WHERE id_usuario = ?', [idUsuario]);

exports.insertPointTransaction = (idUsuario, idMonedero, cantidad) =>
    ejecutar(
        `INSERT INTO transacciones_puntos (id_usuario, id_monedero, cantidad_transaccion, tipo)
         VALUES (?, ?, ?, 'add resenia')`,
        [idUsuario, idMonedero, cantidad]
    );

exports.addPoints = (idUsuario, cantidad) =>
    ejecutar(
        'UPDATE monedero SET puntos = puntos + ? WHERE id_usuario = ?',
        [cantidad, idUsuario]
    );

exports.getReviewsByUser = (idUsuario) =>
    consulta(
        `SELECT r.*, m.nombre AS plato_name, m.img_src AS plato_img
         FROM resenas r
         LEFT JOIN menu m ON r.id_plato = m.id
         WHERE r.id_usuario = ?
         ORDER BY r.creado_en DESC`,
        [idUsuario]
    );

exports.getReviewsByPlato = (id_plato) =>
    consulta(
        `SELECT r.*, u.nombre AS first_name, u.apellido AS last_name
         FROM resenas r
         LEFT JOIN usuarios u ON r.id_usuario = u.id
         WHERE r.id_plato = ?
         ORDER BY r.creado_en DESC`,
        [id_plato]
    );