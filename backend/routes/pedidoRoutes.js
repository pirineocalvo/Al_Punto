const express = require('express');
const enrutador = express.Router();
const controladorPedido = require('../controllers/pedidoController');
const { authMiddleware, adminMiddleware, waiterMiddleware } = require('../middlewares/authMiddleware');

enrutador.post('/crear', authMiddleware, controladorPedido.crearPedido);
enrutador.get('/misPedidos', authMiddleware, controladorPedido.obtenerMisPedidos);
enrutador.delete('/cancelar/:id', authMiddleware, controladorPedido.cancelarPedido);
enrutador.get('/admin/todos', waiterMiddleware, controladorPedido.obtenerTodosAdmin);
enrutador.patch('/admin/:id/estado', waiterMiddleware, controladorPedido.actualizarEstado);

module.exports = enrutador;