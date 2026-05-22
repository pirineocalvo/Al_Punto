const servicioReserva = require('../services/reservaService');

exports.crearReserva = async (req, res) => {
    const { fecha, hora, comensales } = req.body;
    try {
        const resultado = await servicioReserva.crearReserva(req.userId, fecha, hora, comensales);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerMisReservas = async (req, res) => {
    try {
        const reservas = await servicioReserva.obtenerMisReservas(req.userId);
        res.json(reservas);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.cancelarReserva = async (req, res) => {
    try {
        const resultado = await servicioReserva.cancelarReserva(req.userId, req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerTodasAdmin = async (req, res) => {
    try {
        const reservas = await servicioReserva.obtenerTodasAdmin();
        res.json({ reservations: reservas });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.actualizarEstadoAdmin = async (req, res) => {
    const { estado, atendido } = req.body;
    try {
        const resultado = await servicioReserva.actualizarEstadoAdmin(req.params.id, estado, atendido);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};