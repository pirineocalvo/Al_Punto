const repositorioPedido = require('../repositories/pedidoRepository');

function agruparFilasPedido(filas, esAdmin = false) {
    const mapaPedidos = {};
    for (const fila of filas) {
        if (!mapaPedidos[fila.id]) {
            mapaPedidos[fila.id] = {
                id: fila.id,
                total_price: fila.total_price,
                status: fila.status,
                created_at: fila.created_at,
                is_picked_up: fila.is_picked_up,
                items: [],
                ...(esAdmin && {
                    customer: `${fila.first_name} ${fila.last_name}`,
                    email: fila.email,
                }),
            };
        }
        if (fila.item_id) {
            mapaPedidos[fila.id].items.push({
                id: fila.item_id,
                product_id: fila.product_id,
                quantity: fila.quantity,
                price_at_time: fila.price_at_time,
                product_name: fila.product_name,
                ...(!esAdmin && { img_src: fila.img_src }),
            });
        }
    }
    return Object.values(mapaPedidos);
}

exports.crearPedido = async (idUsuario, items, precioTotal) => {
    if (!items || items.length === 0) {
        const error = new Error('No hay items en el pedido');
        error.status = 400;
        throw error;
    }

    const idPedido = await repositorioPedido.insertOrder(idUsuario, precioTotal);
    await Promise.all(items.map(item =>
        repositorioPedido.insertOrderItem(idPedido, item.product_id, item.quantity, item.price_at_time)
    ));

    return { message: 'Pedido creado correctamente', idPedido };
};

exports.obtenerMisPedidos = async (idUsuario) => {
    const filas = await repositorioPedido.getOrdersByUser(idUsuario);
    return agruparFilasPedido(filas, false);
};

exports.cancelarPedido = async (idUsuario, idPedido) => {
    const cambios = await repositorioPedido.cancelOrder(idPedido, idUsuario);
    if (cambios === 0) {
        const error = new Error('Pedido no encontrado o no se puede cancelar');
        error.status = 404;
        throw error;
    }
    return { message: 'Pedido cancelado correctamente' };
};

exports.obtenerTodosAdmin = async () => {
    const filas = await repositorioPedido.getAllOrders();
    return agruparFilasPedido(filas, true);
};

exports.actualizarEstado = async (idPedido, estado, recogido) => {
    const pedido = await repositorioPedido.getOrderById(idPedido);
    if (!pedido) {
        const error = new Error('Pedido no encontrado');
        error.status = 404;
        throw error;
    }

    const cambios = await repositorioPedido.updateOrderStatus(idPedido, estado, recogido ? 1 : 0);
    if (cambios === 0) {
        const error = new Error('Pedido no encontrado');
        error.status = 404;
        throw error;
    }

    return { message: 'Pedido actualizado correctamente' };
};