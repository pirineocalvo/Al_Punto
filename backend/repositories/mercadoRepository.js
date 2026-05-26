const db = require('../utils/db');

const Monedero = require('../classes/Monedero');
const ProductoMercado = require('../classes/ProductoMercado');
const CarteraItem  = require('../classes/CarteraItem');
const Nivel = require('../classes/Nivel');

const consulta    = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, filas) => err ? reject(err) : resolve(filas))
);
const consultaUno = (sql, params = []) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, fila)  => err ? reject(err) : resolve(fila))
);
const ejecutar    = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this.changes); })
);

exports.getLevelByUserPoints = async (idUsuario) => {
    const fila = await consultaUno(
        `SELECT id FROM niveles
         WHERE puntos_min <= (SELECT puntos FROM monedero WHERE id_usuario = ?)
           AND puntos_max >= (SELECT puntos FROM monedero WHERE id_usuario = ?)
         LIMIT 1`,
        [idUsuario, idUsuario]
    );
    return fila ? new Nivel(fila) : null;
};

exports.getItemsByLevel = async (idNivel) => {
    const filas = await consulta(
        `SELECT id, nombre AS name, descripcion AS description,
                precio_puntos AS points_price, id_nivel_min AS min_level_id,
                img_src, creado_en AS created_at
         FROM mercado WHERE id_nivel_min <= ?`,
        [idNivel]
    );
    return filas.map(f => new ProductoMercado(f));
};

exports.getPocketByUser = async (idUsuario) => {
    const filas = await consulta(
        `SELECT c.id AS pocket_id, c.usado AS is_used, c.anadido_en AS added_at,
                c.usado_en AS used_at, c.token_url,
                m.id AS product_id, m.nombre AS name, m.descripcion AS description,
                m.img_src, m.precio_puntos AS points_price
         FROM cartera c
         INNER JOIN mercado m ON c.id_producto = m.id
         WHERE c.id_usuario = ?
         ORDER BY c.usado ASC, c.anadido_en DESC`,
        [idUsuario]
    );
    return filas.map(f => new CarteraItem({ ...f, id_usuario: idUsuario }));
};

exports.getProductById = async (idProducto) => {
    const fila = await consultaUno(
        'SELECT id, nombre AS name, precio_puntos AS points_price, id_nivel_min AS min_level_id FROM mercado WHERE id = ?',
        [idProducto]
    );
    return fila ? new ProductoMercado(fila) : null;
};

exports.getWalletByUser = async (idUsuario) => {
    const fila = await consultaUno(
        'SELECT id, puntos AS points FROM monedero WHERE id_usuario = ?',
        [idUsuario]
    );
    return fila ? new Monedero({ id: fila.id, id_usuario: idUsuario, points: fila.points }) : null;
};

exports.deductPoints = (idUsuario, cantidad) => ejecutar(
    'UPDATE monedero SET puntos = puntos - ? WHERE id_usuario = ?',
    [cantidad, idUsuario]
);

exports.insertPocketItem = (idUsuario, idProducto, tokenUrl) => ejecutar(
    'INSERT INTO cartera (id_usuario, id_producto, token_url) VALUES (?, ?, ?)',
    [idUsuario, idProducto, tokenUrl]
);

exports.insertPointTransaction = (idUsuario, idMonedero, cantidad, tipo) => ejecutar(
    'INSERT INTO transacciones_puntos (id_usuario, id_monedero, cantidad_transaccion, tipo) VALUES (?, ?, ?, ?)',
    [idUsuario, idMonedero, cantidad, tipo]
);

exports.getPocketByToken = async (tokenUrl, idUsuario) => {
    const fila = await consultaUno(
        `SELECT c.id AS pocket_id, c.usado AS is_used, c.usado_en AS used_at,
                c.anadido_en AS added_at,
                m.id AS product_id, m.nombre AS name,
                m.descripcion AS description, m.img_src,
                u.id AS user_id, u.nombre AS first_name, u.apellido AS last_name, u.email
         FROM cartera c
         INNER JOIN mercado m ON c.id_producto = m.id
         INNER JOIN usuarios u ON c.id_usuario = u.id
         WHERE c.token_url = ? AND c.id_usuario = ?`,
        [tokenUrl, idUsuario]
    );
    return fila ? new CarteraItem({ ...fila, id_usuario: idUsuario, token_url: tokenUrl }) : null;
};

exports.getPocketStatusByToken = async (tokenUrl, idUsuario) => {
    const fila = await consultaUno(
        'SELECT id AS pocket_id, usado AS is_used FROM cartera WHERE token_url = ? AND id_usuario = ?',
        [tokenUrl, idUsuario]
    );
    return fila ? new CarteraItem({ ...fila, id_usuario: idUsuario, token_url: tokenUrl }) : null;
};

exports.markPocketAsUsed = (idCartera, usadoEn) => ejecutar(
    'UPDATE cartera SET usado = 1, usado_en = ? WHERE id = ? AND usado = 0',
    [usadoEn, idCartera]
);