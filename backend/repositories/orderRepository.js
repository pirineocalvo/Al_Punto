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
        'INSERT INTO Orders (user_id, total_price, status, is_picked_up) VALUES (?, ?, ?, ?)',
        [userId, total_price, 'pendiente', 0]
    );
    return result.lastID;
};

exports.insertOrderItem = (orderId, product_id, quantity, price_at_time) =>
    run(
        'INSERT INTO Order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
        [orderId, product_id, quantity, price_at_time]
    );

exports.getOrdersByUser = (userId) =>
    query(
        `SELECT Orders.id, Orders.total_price, Orders.status, Orders.created_at, Orders.is_picked_up,
                Order_items.id AS item_id, Order_items.quantity, Order_items.price_at_time,
                Order_items.product_id,
                Menu.name AS product_name, Menu.img_src
         FROM Orders
         LEFT JOIN Order_items ON Orders.id = Order_items.order_id
         LEFT JOIN Menu        ON Order_items.product_id = Menu.id
         WHERE Orders.user_id = ?
         ORDER BY Orders.created_at DESC`,
        [userId]
    );

exports.cancelOrder = async (orderId, userId) => {
    const result = await run(
        'UPDATE Orders SET status = "cancelado" WHERE id = ? AND user_id = ? AND status = "pendiente"',
        [orderId, userId]
    );
    return result.changes;
};

exports.getAllOrders = () =>
    query(
        `SELECT Orders.id, Orders.total_price, Orders.status, Orders.created_at, Orders.is_picked_up,
                Users.first_name, Users.last_name, Users.email,
                Order_items.id AS item_id, Order_items.quantity, Order_items.price_at_time,
                Menu.name AS product_name
         FROM Orders
         LEFT JOIN Users       ON Orders.user_id = Users.id
         LEFT JOIN Order_items ON Orders.id = Order_items.order_id
         LEFT JOIN Menu        ON Order_items.product_id = Menu.id
         ORDER BY Orders.created_at DESC`
    );

exports.getOrderById = (orderId) =>
    queryOne('SELECT user_id FROM Orders WHERE id = ?', [orderId]);

exports.updateOrderStatus = async (orderId, status, is_picked_up) => {
    const result = await run(
        'UPDATE Orders SET status = ?, is_picked_up = ? WHERE id = ?',
        [status, is_picked_up, orderId]
    );
    return result.changes;
};