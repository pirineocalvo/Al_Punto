const servicioMesa = require('../services/mesaService');

exports.obtenerDisponibilidadMes = async (req, res) => {
    const { anio, mes } = req.query;
    try {
        const resultado = await servicioMesa.obtenerDisponibilidadMes(anio, mes);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerDisponibilidadDia = async (req, res) => {
    const { fecha, ocupantes } = req.query;
    try {
        const resultado = await servicioMesa.obtenerDisponibilidadDia(fecha, ocupantes);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.reservarMesa = async (req, res) => {
    const { idReserva, idMesa } = req.body;
    try {
        const resultado = await servicioMesa.reservarMesa(req.userId, idReserva, idMesa);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerTodasMesas = async (req, res) => {
    try {
        const mesas = await servicioMesa.obtenerTodasMesas();
        res.json(mesas);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.crearMesa = async (req, res) => {
    const { name, n_ocupantes } = req.body;
    try {
        const resultado = await servicioMesa.crearMesa(name, n_ocupantes);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.actualizarMesa = async (req, res) => {
    const { name, n_ocupantes, activo } = req.body;
    try {
        const resultado = await servicioMesa.actualizarMesa(req.params.id, name, n_ocupantes, activo);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.desactivarMesa = async (req, res) => {
    try {
        const resultado = await servicioMesa.desactivarMesa(req.params.id);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};