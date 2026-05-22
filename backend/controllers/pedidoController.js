const servicioPedido = require('../services/pedidoService');

exports.crearPedido = async (req, res) => {
    try {
        const resultado = await servicioPedido.crearPedido(req.userId, req.body.items, req.body.total_price);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerMisPedidos = async (req, res) => {
    try {
        const pedidos = await servicioPedido.obtenerMisPedidos(req.userId);
        res.json(pedidos);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.cancelarPedido = async (req, res) => {
    try {
        const resultado = await servicioPedido.cancelarPedido(req.userId, req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerTodosAdmin = async (req, res) => {
    try {
        const pedidos = await servicioPedido.obtenerTodosAdmin();
        res.json(pedidos);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.actualizarEstado = async (req, res) => {
    const { estado, recogido } = req.body;
    try {
        const resultado = await servicioPedido.actualizarEstado(req.params.id, estado, recogido);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};