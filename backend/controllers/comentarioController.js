const servicioComentario = require('../services/comentarioService');

exports.crearResenia = async (req, res) => {
    const { id_plato, descripcion, puntuacion } = req.body;
    try {
        const resultado = await servicioComentario.crearResenia(req.userId, id_plato, descripcion, puntuacion);
        res.status(201).json(resultado);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerMisResenias = async (req, res) => {
    try {
        const resenias = await servicioComentario.obtenerMisResenias(req.userId);
        res.json(resenias);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};

exports.obtenerPorPlato = async (req, res) => {
    try {
        const resenias = await servicioComentario.obtenerPorPlato(req.params.id_plato);
        res.json(resenias);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
};