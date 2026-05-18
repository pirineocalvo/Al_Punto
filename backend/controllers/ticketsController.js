const ticketsService = require('../services/ticketsService');

exports.uploadTicket = async (req, res) => {
    try {
        const result = await ticketsService.uploadTicket(req.userId, req.file, req.generatedFileName);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await ticketsService.getMyTickets(req.userId);
        res.json(tickets);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};