const express = require('express');
const enrutador = express.Router();
const controladorPedido = require('../controllers/pedidoController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

enrutador.post('/crear', authMiddleware, controladorPedido.crearPedido);
enrutador.get('/misPedidos', authMiddleware, controladorPedido.obtenerMisPedidos);
enrutador.delete('/cancelar/:id', authMiddleware, controladorPedido.cancelarPedido);
enrutador.get('/admin/todos', authMiddleware, adminMiddleware, controladorPedido.obtenerTodosAdmin);
enrutador.patch('/admin/:id/estado', authMiddleware, adminMiddleware, controladorPedido.actualizarEstado);

module.exports = enrutador;