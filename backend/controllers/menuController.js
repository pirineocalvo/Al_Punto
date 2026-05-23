const servicioMenu = require('../services/menuService');

exports.obtenerTodosItems = async (req, res) => {
    try {
        const items = await servicioMenu.obtenerTodosItems();
        res.json(items);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerCategorias = async (req, res) => {
    try {
        const categorias = await servicioMenu.obtenerCategorias();
        res.json(categorias);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerItemsPorCategoria = async (req, res) => {
    try {
        const items = await servicioMenu.obtenerItemsPorCategoria(req.params.idcategory);
        res.json(items);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.crearItem = async (req, res) => {
    try {
        const resultado = await servicioMenu.crearItem(req.body);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.crearCategoria = async (req, res) => {
    try {
        const resultado = await servicioMenu.crearCategoria(req.body.name);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.actualizarItem = async (req, res) => {
    try {
        const resultado = await servicioMenu.actualizarItem(req.body);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};