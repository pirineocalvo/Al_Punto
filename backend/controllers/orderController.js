const orderService = require('../services/orderService');

exports.createOrder = async (req, res) => {
    try {
        const result = await orderService.createOrder(req.userId, req.body.items, req.body.total_price);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getMisPedidos = async (req, res) => {
    try {
        const pedidos = await orderService.getMisPedidos(req.userId);
        res.json(pedidos);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.cancelarPedido = async (req, res) => {
    try {
        const result = await orderService.cancelarPedido(req.userId, req.params.id);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getTodosAdmin = async (req, res) => {
    try {
        const pedidos = await orderService.getTodosAdmin();
        res.json(pedidos);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.updateStatus = async (req, res) => {
    const { status, is_picked_up } = req.body;
    try {
        const result = await orderService.updateStatus(req.params.id, status, is_picked_up);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};