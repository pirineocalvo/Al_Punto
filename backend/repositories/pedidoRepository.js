const db = require('../utils/db');

const Pedido = require('../classes/Pedido');
const PedidoAdmin = require('../classes/PedidoAdmin');

const consulta = (sql, params = []) => new Promise((resolve, reject) =>
    db.all(sql, params, (err, filas) => err ? reject(err) : resolve(filas))
);
const consultaUno = (sql, params = []) => new Promise((resolve, reject) =>
    db.get(sql, params, (err, fila) => err ? reject(err) : resolve(fila))
);
const ejecutar = (sql, params = []) => new Promise((resolve, reject) =>
    db.run(sql, params, function (err) { err ? reject(err) : resolve(this); })
);

exports.insertOrder = async (idUsuario, precioTotal) => {
    const resultado = await ejecutar(
        'INSERT INTO pedidos (id_usuario, precio_total, estado, recogido) VALUES (?, ?, ?, ?)',
        [idUsuario, precioTotal, 'pendiente', 0]
    );

    return new Pedido({
        id:          resultado.lastID,
        id_usuario:  idUsuario,
        total_price: precioTotal,
        status:      'pendiente',
        items:       [],
    });
};

exports.insertOrderItem = (idPedido, idProducto, cantidad, precioEnCompra) =>
    ejecutar(
        'INSERT INTO items_pedido (id_pedido, id_producto, cantidad, precio_en_compra) VALUES (?, ?, ?, ?)',
        [idPedido, idProducto, cantidad, precioEnCompra]
    );

exports.getOrdersByUser = async (idUsuario) =>{
    const filas = await consulta(
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
        [idUsuario]  
    )
    const mapa = {};
        for (const fila of filas) {
            if (!mapa[fila.id]) {
                mapa[fila.id] = new Pedido({
                    id:          fila.id,
                    id_usuario:  idUsuario,
                    total_price: fila.total_price,
                    status:      fila.status,
                    created_at:  fila.created_at,
                    is_picked_up: fila.is_picked_up,
                    items:       [],
                });
            }
            if (fila.item_id) {
                mapa[fila.id].items.push({
                    id:           fila.item_id,
                    product_id:   fila.product_id,
                    quantity:     fila.quantity,
                    price_at_time: fila.price_at_time,
                    product_name: fila.product_name,
                    img_src:      fila.img_src,
                });
            }
        }
        console.log();
        
    return Object.values(mapa);
};

exports.cancelOrder = async (idPedido, idUsuario) => {
    const resultado = await ejecutar(
        'UPDATE pedidos SET estado = "cancelado" WHERE id = ? AND id_usuario = ? AND estado = "pendiente"',
        [idPedido, idUsuario]
    );
    return resultado.changes;
};

exports.getAllOrders = async () =>{
    const filas = await consulta(
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

    const mapa = {};
        for (const fila of filas) {
            if (!mapa[fila.id]) {
                mapa[fila.id] = new PedidoAdmin({
                    id: fila.id,
                    id_usuario: null,
                    total_price: fila.total_price,
                    status: fila.status,
                    created_at: fila.created_at,
                    is_picked_up: fila.is_picked_up,
                    first_name: fila.first_name,
                    last_name: fila.last_name,
                    email: fila.email,
                    items: [],
                });
            }
            if (fila.item_id) {
                mapa[fila.id].items.push({
                    id:           fila.item_id,
                    quantity:     fila.quantity,
                    price_at_time: fila.price_at_time,
                    product_name: fila.product_name,
                });
            }
        }
    return Object.values(mapa);
}

exports.getOrderById = (idPedido) =>
    consultaUno('SELECT id_usuario AS user_id FROM pedidos WHERE id = ?', [idPedido]);

exports.updateOrderStatus = async (idPedido, estado, recogido) => {
    const resultado = await ejecutar(
        'UPDATE pedidos SET estado = ?, recogido = ? WHERE id = ?',
        [estado, recogido, idPedido]
    );
    return resultado.changes;
};