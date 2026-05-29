const repositorioPedido = require('../repositories/pedidoRepository');

exports.crearPedido = async (idUsuario, items, precioTotal) => {
    if (!items || items.length === 0) {
        const error = new Error('No hay items en el pedido');
        error.status = 400;
        throw error;
    }

    const pedido = await repositorioPedido.insertOrder(idUsuario, precioTotal);

    await Promise.all(items.map(item =>
        repositorioPedido.insertOrderItem(
            pedido.id, item.product_id, item.quantity, item.price_at_time
        )
    ));

    pedido.items = items;
    return {
        message: 'Pedido creado correctamente',
        pedido: pedido.toJSON(),
        idPedido: pedido.id,
    };
};

exports.obtenerMisPedidos = async (idUsuario) => {
    const pedidos = await repositorioPedido.getOrdersByUser(idUsuario);
    return pedidos.map(p => p.toJSON());
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
    const pedidos = await repositorioPedido.getAllOrders();
    return pedidos.map(p => p.toJSON());
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