const mesasService = require('../services/mesasService');

exports.getDisponibilidadMes = async (req, res) => {
    const { year, month } = req.query;
    try {
        const result = await mesasService.getDisponibilidadMes(year, month);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getDisponibilidadDia = async (req, res) => {
    const { fecha, ocupantes } = req.query;
    try {
        const result = await mesasService.getDisponibilidadDia(fecha, ocupantes);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.reservarMesa = async (req, res) => {
    const { idReserva, idMesa } = req.body;
    try {
        const result = await mesasService.reservarMesa(req.userId, idReserva, idMesa);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getTodasMesas = async (req, res) => {
    try {
        const mesas = await mesasService.getTodasMesas();
        res.json(mesas);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.crearMesa = async (req, res) => {
    const { name, n_ocupantes } = req.body;
    try {
        const result = await mesasService.crearMesa(name, n_ocupantes);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.actualizarMesa = async (req, res) => {
    const { name, n_ocupantes, activo } = req.body;
    try {
        const result = await mesasService.actualizarMesa(req.params.id, name, n_ocupantes, activo);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.desactivarMesa = async (req, res) => {
    try {
        const result = await mesasService.desactivarMesa(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};