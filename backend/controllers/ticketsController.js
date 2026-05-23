const servicioTickets = require('../services/ticketsService');

exports.subirTicket = async (req, res) => {
    try {
        const resultado = await servicioTickets.subirTicket(req.userId, req.file, req.nombreArchivoGenerado);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerMisTickets = async (req, res) => {
    try {
        const tickets = await servicioTickets.obtenerMisTickets(req.userId);
        res.json(tickets);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};