const menuService = require('../services/menuService');

exports.getAllItems = async (req, res) => {
    try {
        const items = await menuService.getAllItems();
        res.json(items);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await menuService.getCategories();
        res.json(categories);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getItemsByCategory = async (req, res) => {
    try {
        const items = await menuService.getItemsByCategory(req.params.idcategory);
        res.json(items);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.createItem = async (req, res) => {
    try {
        const result = await menuService.createItem(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const result = await menuService.createCategory(req.body.name);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const result = await menuService.updateItem(req.body);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};