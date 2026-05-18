const reseniasService = require('../services/reseniasService');

exports.createResenia = async (req, res) => {
    const { id_plato, descripcion, puntuacion } = req.body;
    try {
        const result = await reseniasService.createResenia(req.userId, id_plato, descripcion, puntuacion);
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await reseniasService.getMyReviews(req.userId);
        res.json(reviews);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};

exports.getByPlato = async (req, res) => {
    try {
        const reviews = await reseniasService.getByPlato(req.params.id_plato);
        res.json(reviews);
    } catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
};