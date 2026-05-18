const orderRepo          = require('../repositories/orderRepository');
const { createNotification } = require('../utils/notifications');

function groupOrderRows(rows, isAdmin = false) {
    const ordersMap = {};
    for (const row of rows) {
        if (!ordersMap[row.id]) {
            ordersMap[row.id] = {
                id:           row.id,
                total_price:  row.total_price,
                status:       row.status,
                created_at:   row.created_at,
                is_picked_up: row.is_picked_up,
                items:        [],
                ...(isAdmin && {
                    customer: `${row.first_name} ${row.last_name}`,
                    email:    row.email,
                }),
            };
        }
        if (row.item_id) {
            ordersMap[row.id].items.push({
                id:            row.item_id,
                product_id:    row.product_id,
                quantity:      row.quantity,
                price_at_time: row.price_at_time,
                product_name:  row.product_name,
                ...(!isAdmin && { img_src: row.img_src }),
            });
        }
    }
    return Object.values(ordersMap);
}

exports.createOrder = async (userId, items, total_price) => {
    if (!items || items.length === 0) {
        const err = new Error('No hay items en el pedido');
        err.status = 400;
        throw err;
    }

    const orderId = await orderRepo.insertOrder(userId, total_price);
    await Promise.all(items.map(item =>
        orderRepo.insertOrderItem(orderId, item.product_id, item.quantity, item.price_at_time)
    ));

    return { message: 'Pedido creado correctamente', orderId };
};

exports.getMisPedidos = async (userId) => {
    const rows = await orderRepo.getOrdersByUser(userId);
    return groupOrderRows(rows, false);
};

exports.cancelarPedido = async (userId, orderId) => {
    const changes = await orderRepo.cancelOrder(orderId, userId);
    if (changes === 0) {
        const err = new Error('Pedido no encontrado o no se puede cancelar');
        err.status = 404;
        throw err;
    }
    return { message: 'Pedido cancelado correctamente' };
};

exports.getTodosAdmin = async () => {
    const rows = await orderRepo.getAllOrders();
    return groupOrderRows(rows, true);
};

exports.updateStatus = async (orderId, status, is_picked_up) => {
    const order = await orderRepo.getOrderById(orderId);
    if (!order) {
        const err = new Error('Pedido no encontrado');
        err.status = 404;
        throw err;
    }

    const changes = await orderRepo.updateOrderStatus(orderId, status, is_picked_up ? 1 : 0);
    if (changes === 0) {
        const err = new Error('Pedido no encontrado');
        err.status = 404;
        throw err;
    }

    if (status === 'listo')
        createNotification(order.user_id, `Tu pedido #${orderId} está listo para recoger`, 'order');
    else if (status === 'entregado')
        createNotification(order.user_id, `Tu pedido #${orderId} ha sido entregado. ¡Gracias!`, 'order');

    return { message: 'Pedido actualizado correctamente' };
};