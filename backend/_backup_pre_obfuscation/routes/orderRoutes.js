const express = require('express');
const router = express.Router();
const { authenticateWithLocal, requireAdmin } = require('../middleware/auth');
const db = require('../utils/db');
const { createNotification } = require('../utils/notifications');

// Crear un pedido para recoger
router.post('/create', authenticateWithLocal, (req, res) => {
    const { items, total_price } = req.body;
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No hay items en el pedido' });
    }

    db.run(
        'INSERT INTO Orders (user_id, total_price, status, is_picked_up) VALUES (?, ?, ?, ?)',
        [req.localUserId, total_price, 'pendiente', 0],
        function (err) {
            if (err) return res.status(500).json({ error: 'Error al crear el pedido' });
            const orderId = this.lastID;

            const insertItem = (index) => {
                if (index >= items.length) return res.json({ message: 'Pedido creado correctamente', orderId });
                const item = items[index];
                db.run(
                    'INSERT INTO Order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price_at_time],
                    (err) => {
                        if (err) return res.status(500).json({ error: 'Error al añadir items al pedido' });
                        insertItem(index + 1);
                    }
                );
            };
            insertItem(0);
        }
    );
});

// Obtener pedidos del usuario
router.get('/mis-pedidos', authenticateWithLocal, (req, res) => {
    const query = `
        SELECT Orders.id, Orders.total_price, Orders.status, Orders.created_at, Orders.is_picked_up,
               Order_items.id as item_id, Order_items.quantity, Order_items.price_at_time,
               Menu.name as product_name, Menu.img_src
        FROM Orders
        LEFT JOIN Order_items ON Orders.id = Order_items.order_id
        LEFT JOIN Menu ON Order_items.product_id = Menu.id
        WHERE Orders.user_id = ?
        ORDER BY Orders.created_at DESC
    `;
    db.all(query, [req.localUserId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener los pedidos' });

        const orders = {};
        rows.forEach(row => {
            if (!orders[row.id]) {
                orders[row.id] = { id: row.id, total_price: row.total_price, status: row.status, created_at: row.created_at, is_picked_up: row.is_picked_up, items: [] };
            }
            if (row.item_id) orders[row.id].items.push({ id: row.item_id, quantity: row.quantity, price_at_time: row.price_at_time, product_name: row.product_name, img_src: row.img_src });
        });
        res.json(Object.values(orders));
    });
});

// Cancelar pedido
router.delete('/cancelar/:id', authenticateWithLocal, (req, res) => {
    db.run(
        'UPDATE Orders SET status = "cancelado" WHERE id = ? AND user_id = ? AND status = "pendiente"',
        [req.params.id, req.localUserId],
        function (err) {
            if (err) return res.status(500).json({ error: 'Error al cancelar el pedido' });
            if (this.changes === 0) return res.status(404).json({ error: 'Pedido no encontrado o no se puede cancelar' });
            res.json({ message: 'Pedido cancelado correctamente' });
        }
    );
});

// Admin: ver todos los pedidos
router.get('/admin/todos', requireAdmin, (req, res) => {
    const query = `
        SELECT Orders.id, Orders.total_price, Orders.status, Orders.created_at, Orders.is_picked_up,
               Users.first_name, Users.last_name, Users.email,
               Order_items.id as item_id, Order_items.quantity, Order_items.price_at_time,
               Menu.name as product_name
        FROM Orders
        LEFT JOIN Users ON Orders.user_id = Users.id
        LEFT JOIN Order_items ON Orders.id = Order_items.order_id
        LEFT JOIN Menu ON Order_items.product_id = Menu.id
        ORDER BY Orders.created_at DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al obtener los pedidos' });
        const orders = {};
        rows.forEach(row => {
            if (!orders[row.id]) {
                orders[row.id] = { id: row.id, total_price: row.total_price, status: row.status, created_at: row.created_at, is_picked_up: row.is_picked_up, customer: `${row.first_name} ${row.last_name}`, email: row.email, items: [] };
            }
            if (row.item_id) orders[row.id].items.push({ id: row.item_id, quantity: row.quantity, price_at_time: row.price_at_time, product_name: row.product_name });
        });
        res.json(Object.values(orders));
    });
});

// Admin: actualizar estado del pedido
router.patch('/admin/:id/status', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status, is_picked_up } = req.body;

    db.get('SELECT user_id FROM Orders WHERE id = ?', [id], (err, order) => {
        if (err || !order) return res.status(404).json({ error: 'Pedido no encontrado' });

        db.run('UPDATE Orders SET status = ?, is_picked_up = ? WHERE id = ?', [status, is_picked_up ? 1 : 0, id], function (err) {
            if (err) return res.status(500).json({ error: 'Error al actualizar el pedido' });
            if (this.changes === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

            if (status === 'listo') createNotification(order.user_id, `🛎️ Tu pedido #${id} está listo para recoger`, 'order');
            else if (status === 'entregado') createNotification(order.user_id, `✅ Tu pedido #${id} ha sido entregado. ¡Gracias!`, 'order');

            res.json({ message: 'Pedido actualizado correctamente' });
        });
    });
});

module.exports = router;
