const express = require('express');
const router  = express.Router();
const { decrypt }            = require('../utils/crypto');
const db                     = require('../utils/db');
const { createNotification } = require('../utils/notifications');

//Middlewares
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });

    const token  = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId)
        return res.status(401).json({ error: 'Token inválido' });

    req.userId = userId;
    next();
};

const adminMiddleware = (req, res, next) => {
    db.get('SELECT access_level FROM Users WHERE id = ?', [req.userId], (err, user) => {
        if (err)
            return res.status(500).json({ error: 'Error de base de datos' });
        if (!user || user.access_level <= 3)
            return res.status(403).json({ error: 'Acceso denegado: se requiere nivel Staff/Admin' });
        next();
    });
};

//POST /create 
router.post('/create', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });

    const token  = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId)
        return res.status(401).json({ error: 'Token inválido' });

    const { items, total_price } = req.body;

    if (!items || items.length === 0)
        return res.status(400).json({ error: 'No hay items en el pedido' });

    db.run(
        `INSERT INTO Orders (user_id, total_price, status, is_picked_up)
         VALUES (?, ?, ?, ?)`,
        [userId, total_price, 'pendiente', 0],
        function (err) {
            if (err) {
                console.error('Error al crear el pedido:', err);
                return res.status(500).json({ error: 'Error al crear el pedido' });
            }

            const orderId = this.lastID;

            // Insertar los items de forma recursiva (preserva el orden y el control de errores)
            function insertItem(index) {
                if (index >= items.length)
                    return res.json({ message: 'Pedido creado correctamente', orderId });

                const item = items[index];

                db.run(
                    `INSERT INTO Order_items (order_id, product_id, quantity, price_at_time)
                     VALUES (?, ?, ?, ?)`,
                    [orderId, item.product_id, item.quantity, item.price_at_time],
                    (err) => {
                        if (err) {
                            console.error('Error al añadir item al pedido:', err);
                            return res.status(500).json({ error: 'Error al añadir items al pedido' });
                        }
                        insertItem(index + 1);
                    }
                );
            }

            insertItem(0);
        }
    );
});

//GET /mis-pedidos

router.get('/mis-pedidos', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });

    const token  = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId)
        return res.status(401).json({ error: 'Token inválido' });

    const query = `
        SELECT Orders.id, Orders.total_price, Orders.status, Orders.created_at, Orders.is_picked_up,
               Order_items.id AS item_id, Order_items.quantity, Order_items.price_at_time,
               Menu.name AS product_name, Menu.img_src
        FROM Orders
        LEFT JOIN Order_items ON Orders.id = Order_items.order_id
        LEFT JOIN Menu ON Order_items.product_id = Menu.id
        WHERE Orders.user_id = ?
        ORDER BY Orders.created_at DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('Error al obtener pedidos:', err);
            return res.status(500).json({ error: 'Error al obtener los pedidos' });
        }

        const ordersMap = {};
        rows.forEach(row => {
            if (!ordersMap[row.id]) {
                ordersMap[row.id] = {
                    id:           row.id,
                    total_price:  row.total_price,
                    status:       row.status,
                    created_at:   row.created_at,
                    is_picked_up: row.is_picked_up,
                    items:        [],
                };
            }
            if (row.item_id) {
                ordersMap[row.id].items.push({
                    id:             row.item_id,
                    quantity:       row.quantity,
                    price_at_time:  row.price_at_time,
                    product_name:   row.product_name,
                    img_src:        row.img_src,
                });
            }
        });

        res.json(Object.values(ordersMap));
    });
});

//DELETE /cancelar/:id 
router.delete('/cancelar/:id', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });

    const token  = authHeader.split(' ')[1];
    const userId = decrypt(token);
    if (!userId)
        return res.status(401).json({ error: 'Token inválido' });

    const { id } = req.params;

    db.run(
        `UPDATE Orders SET status = "cancelado"
         WHERE id = ? AND user_id = ? AND status = "pendiente"`,
        [id, userId],
        function (err) {
            if (err) {
                console.error('Error al cancelar pedido:', err);
                return res.status(500).json({ error: 'Error al cancelar el pedido' });
            }
            if (this.changes === 0)
                return res.status(404).json({ error: 'Pedido no encontrado o no se puede cancelar' });
            res.json({ message: 'Pedido cancelado correctamente' });
        }
    );
});

//GET /admin/todos
router.get('/admin/todos', authMiddleware, adminMiddleware, (req, res) => {
    const query = `
        SELECT Orders.id, Orders.total_price, Orders.status, Orders.created_at, Orders.is_picked_up,
               Users.first_name, Users.last_name, Users.email,
               Order_items.id AS item_id, Order_items.quantity, Order_items.price_at_time,
               Menu.name AS product_name
        FROM Orders
        LEFT JOIN Users ON Orders.user_id = Users.id
        LEFT JOIN Order_items ON Orders.id = Order_items.order_id
        LEFT JOIN Menu ON Order_items.product_id = Menu.id
        ORDER BY Orders.created_at DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error al obtener todos los pedidos:', err);
            return res.status(500).json({ error: 'Error al obtener los pedidos' });
        }

        const ordersMap = {};
        rows.forEach(row => {
            if (!ordersMap[row.id]) {
                ordersMap[row.id] = {
                    id:           row.id,
                    total_price:  row.total_price,
                    status:       row.status,
                    created_at:   row.created_at,
                    is_picked_up: row.is_picked_up,
                    customer:     `${row.first_name} ${row.last_name}`,
                    email:        row.email,
                    items:        [],
                };
            }
            if (row.item_id) {
                ordersMap[row.id].items.push({
                    id:            row.item_id,
                    quantity:      row.quantity,
                    price_at_time: row.price_at_time,
                    product_name:  row.product_name,
                });
            }
        });

        res.json(Object.values(ordersMap));
    });
});

//PATCH /admin/:id/status
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, (req, res) => {
    const { id }                    = req.params;
    const { status, is_picked_up }  = req.body;

    db.get('SELECT user_id FROM Orders WHERE id = ?', [id], (err, order) => {
        if (err || !order)
            return res.status(404).json({ error: 'Pedido no encontrado' });

        db.run(
            'UPDATE Orders SET status = ?, is_picked_up = ? WHERE id = ?',
            [status, is_picked_up ? 1 : 0, id],
            function (err) {
                if (err)
                    return res.status(500).json({ error: 'Error al actualizar el pedido' });
                if (this.changes === 0)
                    return res.status(404).json({ error: 'Pedido no encontrado' });

                if (status === 'listo')
                    createNotification(order.user_id, `🛎️ Tu pedido #${id} está listo para recoger`, 'order');
                else if (status === 'entregado')
                    createNotification(order.user_id, `✅ Tu pedido #${id} ha sido entregado. ¡Gracias!`, 'order');

                res.json({ message: 'Pedido actualizado correctamente' });
            }
        );
    });
});

module.exports = router;
