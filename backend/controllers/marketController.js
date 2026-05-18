const marketService = require('../services/marketService');
const { getTokenUserId } = require('../middlewares/authMiddleware.js');

exports.getItems = async (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;
    try {
        const items = await marketService.getAvailableItems(userId);
        res.json(items);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getMyPocket = async (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;
    try {
        const pocket = await marketService.getUserPocket(userId);
        res.json(pocket);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.buyItem = async (req, res) => {
    const userId = getTokenUserId(req, res);
    if (!userId) return;
    try {
        await marketService.buyItem(userId, req.params.id);
        res.status(200).json({ message: 'Item comprado con éxito' });
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getPocketToken = async (req, res) => {
    const { userId, tokenUrl } = req.params;
    try {
        const result = await marketService.getPocketToken(userId, tokenUrl);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.usePocketToken = async (req, res) => {
    const { userId, tokenUrl } = req.params;
    try {
        const result = await marketService.usePocketToken(userId, tokenUrl);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};