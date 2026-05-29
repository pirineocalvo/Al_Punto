const db = require('../utils/db');

const Monedero = require('../classes/Monedero');
const Resenia  = require('../classes/Resenia');

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

exports.getWalletByUser = async (idUsuario) => {
    const fila = await consultaUno(
        'SELECT id, puntos AS points FROM monedero WHERE id_usuario = ?',
        [idUsuario]
    );
    return fila ? new Monedero({ id: fila.id, id_usuario: idUsuario, points: fila.points }) : null;
};

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

exports.getReviewsByUser = async (idUsuario) => {
    const filas = await consulta(
        `SELECT r.*,
                COALESCE(m.nombre, '[Producto eliminado]') AS plato_name,
                m.img_src AS plato_img
         FROM resenas r
         LEFT JOIN menu m ON r.id_plato = m.id
         WHERE r.id_usuario = ?
         ORDER BY r.creado_en DESC`,
        [idUsuario]
    );
    return filas.map(f => new Resenia({
        id:          f.id,
        id_plato:    f.id_plato,
        id_usuario:  idUsuario,
        descripcion: f.descripcion,
        puntuacion:  f.puntuacion,
        creado_en:   f.creado_en,
        plato_name:  f.plato_name,
        plato_img:   f.plato_img,
    }));
};

exports.getReviewsByPlato = async (id_plato) => {
    const filas = await consulta(
        `SELECT r.*, u.nombre AS nombre, u.apellido AS apellido
         FROM resenas r
         LEFT JOIN usuarios u ON r.id_usuario = u.id
         WHERE r.id_plato = ?
         ORDER BY r.creado_en DESC`,
        [id_plato]
    );
    return filas.map(f => new Resenia({
        id:          f.id,
        id_plato:    id_plato,
        id_usuario:  f.id_usuario,
        descripcion: f.descripcion,
        puntuacion:  f.puntuacion,
        creado_en:   f.creado_en,
        nombre:      f.nombre,
        apellido:    f.apellido,
    }));
};