const userService = require('../services/userService');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await userService.login(email, password, req.ip);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    const { firstName, lastName, phone, email, password, birthDate } = req.body;
    try {
        const result = await userService.register({ firstName, lastName, phone, email, password, birthDate });
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getUserInfo = async (req, res) => {
    try {
        const info = await userService.getUserInfo(req.userId);
        res.json(info);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await userService.getTransactions(req.userId);
        res.json(transactions);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getLevels = async (req, res) => {
    try {
        const levels = await userService.getLevels();
        res.json(levels);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.updatePerfil = async (req, res) => {
    const { first_name, last_name, phone } = req.body;
    try {
        const result = await userService.updatePerfil(req.userId, first_name, last_name, phone);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.updatePassword = async (req, res) => {
    const { password_actual, password_nueva } = req.body;
    try {
        const result = await userService.updatePassword(req.userId, password_actual, password_nueva);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};