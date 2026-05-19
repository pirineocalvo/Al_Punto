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

exports.insertOrder = async (userId, total_price) => {
    const result = await run(
        'INSERT INTO pedidos (id_usuario, precio_total, estado, recogido) VALUES (?, ?, ?, ?)',
        [userId, total_price, 'pendiente', 0]
    );
    return result.lastID;
};

exports.insertOrderItem = (orderId, product_id, quantity, price_at_time) =>
    run(
        'INSERT INTO items_pedido (id_pedido, id_producto, cantidad, precio_en_compra) VALUES (?, ?, ?, ?)',
        [orderId, product_id, quantity, price_at_time]
    );

exports.getOrdersByUser = (userId) =>
    query(
        `SELECT p.id, p.precio_total AS total_price, p.estado AS status,
                p.creado_en AS created_at, p.recogido AS is_picked_up,
                ip.id AS item_id, ip.cantidad AS quantity,
                ip.precio_en_compra AS price_at_time, ip.id_producto AS product_id,
                m.nombre AS product_name, m.img_src
         FROM pedidos p
         LEFT JOIN items_pedido ip ON p.id = ip.id_pedido
         LEFT JOIN menu m          ON ip.id_producto = m.id
         WHERE p.id_usuario = ?
         ORDER BY p.creado_en DESC`,
        [userId]
    );

exports.cancelOrder = async (orderId, userId) => {
    const result = await run(
        'UPDATE pedidos SET estado = "cancelado" WHERE id = ? AND id_usuario = ? AND estado = "pendiente"',
        [orderId, userId]
    );
    return result.changes;
};

exports.getAllOrders = () =>
    query(
        `SELECT p.id, p.precio_total AS total_price, p.estado AS status,
                p.creado_en AS created_at, p.recogido AS is_picked_up,
                u.nombre AS first_name, u.apellido AS last_name, u.email,
                ip.id AS item_id, ip.cantidad AS quantity,
                ip.precio_en_compra AS price_at_time,
                m.nombre AS product_name
         FROM pedidos p
         LEFT JOIN usuarios u      ON p.id_usuario = u.id
         LEFT JOIN items_pedido ip ON p.id = ip.id_pedido
         LEFT JOIN menu m          ON ip.id_producto = m.id
         ORDER BY p.creado_en DESC`
    );

exports.getOrderById = (orderId) =>
    queryOne('SELECT id_usuario AS user_id FROM pedidos WHERE id = ?', [orderId]);

exports.updateOrderStatus = async (orderId, status, is_picked_up) => {
    const result = await run(
        'UPDATE pedidos SET estado = ?, recogido = ? WHERE id = ?',
        [status, is_picked_up, orderId]
    );
    return result.changes;
};