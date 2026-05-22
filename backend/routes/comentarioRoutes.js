const express = require('express');
const enrutador = express.Router();
const controladorComentario = require('../controllers/comentarioController');
const { authMiddleware } = require('../middlewares/authMiddleware');

enrutador.post('/', authMiddleware, controladorComentario.crearResenia);
enrutador.get('/misResenias', authMiddleware, controladorComentario.obtenerMisResenias);
enrutador.get('/:id_plato', controladorComentario.obtenerPorPlato);

module.exports = enrutador;