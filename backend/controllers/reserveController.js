const reserveService = require('../services/reserveService');

exports.addReserve = async (req, res) => {
    const { fecha, hora, comensales } = req.body;
    try {
        const result = await reserveService.addReserve(req.userId, fecha, hora, comensales);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getUserReserves = async (req, res) => {
    try {
        const reservas = await reserveService.getUserReserves(req.userId);
        res.json(reservas);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.cancelarReserva = async (req, res) => {
    try {
        const result = await reserveService.cancelarReserva(req.userId, req.params.id);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getAllReservesAdmin = async (req, res) => {
    try {
        const reservas = await reserveService.getAllReservesAdmin();
        res.json({ reservations: reservas });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.updateStatusAdmin = async (req, res) => {
    const { status, attended } = req.body;  
    try {
        const result = await reserveService.updateStatusAdmin(req.params.id, status, attended);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};