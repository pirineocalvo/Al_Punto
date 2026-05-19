const db = require('../utils/db');

const query = (sql, params) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows))
);
const queryOne = (sql, params) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))
);
const run = (sql, params) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this.changes); })
);

exports.getLevelByUserPoints = (userId) => query(
    `SELECT id FROM niveles
     WHERE puntos_min <= (SELECT puntos FROM monedero WHERE id_usuario = ?)
       AND puntos_max >= (SELECT puntos FROM monedero WHERE id_usuario = ?)`,
    [userId, userId]
);

exports.getItemsByLevel = (levelId) => query(
    `SELECT id, nombre AS name, descripcion AS description,
            precio_puntos AS points_price, id_nivel_min AS min_level_id,
            img_src, creado_en AS created_at
     FROM mercado WHERE id_nivel_min <= ?`,
    [levelId]
);

exports.getPocketByUser = (userId) => query(
    `SELECT c.id AS pocket_id, c.usado AS is_used, c.anadido_en AS added_at,
            c.usado_en AS used_at, c.token_url,
            m.id AS product_id, m.nombre AS name, m.descripcion AS description,
            m.img_src, m.precio_puntos AS points_price
     FROM cartera c
     INNER JOIN mercado m ON c.id_producto = m.id
     WHERE c.id_usuario = ?
     ORDER BY c.usado ASC, c.anadido_en DESC`,
    [userId]
);

exports.getProductById = (productId) => queryOne(
    'SELECT precio_puntos AS points_price FROM mercado WHERE id = ?',
    [productId]
);

exports.getWalletByUser = (userId) => queryOne(
    'SELECT id, puntos AS points FROM monedero WHERE id_usuario = ?',
    [userId]
);

exports.deductPoints = (userId, amount) => run(
    'UPDATE monedero SET puntos = puntos - ? WHERE id_usuario = ?',
    [amount, userId]
);

exports.insertPocketItem = (userId, productId, tokenUrl) => run(
    'INSERT INTO cartera (id_usuario, id_producto, token_url) VALUES (?, ?, ?)',
    [userId, productId, tokenUrl]
);

exports.insertPointTransaction = (userId, walletId, amount, type) => run(
    `INSERT INTO transacciones_puntos (id_usuario, id_monedero, cantidad_transaccion, tipo) VALUES (?, ?, ?, ?)`,
    [userId, walletId, amount, type]
);

exports.getPocketByToken = (tokenUrl, userId) => queryOne(
    `SELECT c.id AS pocket_id, c.usado AS is_used, c.usado_en AS used_at,
            c.expira_en AS expires_at, c.anadido_en AS added_at,
            m.id AS product_id, m.nombre AS product_name,
            m.descripcion AS product_description, m.img_src,
            u.id AS user_id, u.nombre AS first_name, u.apellido AS last_name, u.email
     FROM cartera c
     INNER JOIN mercado m ON c.id_producto = m.id
     INNER JOIN usuarios u ON c.id_usuario = u.id
     WHERE c.token_url = ? AND c.id_usuario = ?`,
    [tokenUrl, userId]
);

exports.getPocketStatusByToken = (tokenUrl, userId) => queryOne(
    'SELECT id, usado AS is_used, expira_en AS expires_at FROM cartera WHERE token_url = ? AND id_usuario = ?',
    [tokenUrl, userId]
);

exports.markPocketAsUsed = (pocketId, usedAt) => run(
    'UPDATE cartera SET usado = 1, usado_en = ? WHERE id = ? AND usado = 0',
    [usedAt, pocketId]
);