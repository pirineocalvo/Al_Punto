const servicioMercado = require('../services/mercadoService.js');
const { getTokenUserId } = require('../middlewares/authMiddleware.js');

exports.obtenerProductos = async (req, res) => {
    const idUsuario = getTokenUserId(req, res);
    if (!idUsuario) return;
    try {
        const productos = await servicioMercado.obtenerProductosDisponibles(idUsuario);
        res.json(productos);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerMiCartera = async (req, res) => {
    const idUsuario = getTokenUserId(req, res);
    if (!idUsuario) return;
    try {
        const cartera = await servicioMercado.obtenerCarteraUsuario(idUsuario);
        res.json(cartera);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.comprarProducto = async (req, res) => {
    const idUsuario = getTokenUserId(req, res);
    if (!idUsuario) return;
    try {
        await servicioMercado.comprarProducto(idUsuario, req.params.id);
        res.status(200).json({ message: 'Item comprado con exito' });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerTokenCartera = async (req, res) => {
    const { idUsuario, tokenUrl } = req.params;
    try {
        const resultado = await servicioMercado.obtenerTokenCartera(idUsuario, tokenUrl);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.usarTokenCartera = async (req, res) => {
    const { idUsuario, tokenUrl } = req.params;
    try {
        const resultado = await servicioMercado.usarTokenCartera(idUsuario, tokenUrl);
        res.json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};