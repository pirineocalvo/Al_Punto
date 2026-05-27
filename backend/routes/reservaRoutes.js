const express = require('express');
const enrutador = express.Router();
const controladorReserva = require('../controllers/reservaController');
const { authMiddleware, adminMiddleware, waiterMiddleware } = require('../middlewares/authMiddleware');

enrutador.post('/nueva', authMiddleware, controladorReserva.crearReserva);
enrutador.get('/misReservas', authMiddleware, controladorReserva.obtenerMisReservas);
enrutador.delete('/cancelar/:id', authMiddleware, controladorReserva.cancelarReserva);
enrutador.get('/admin/todas', waiterMiddleware, controladorReserva.obtenerTodasAdmin);
enrutador.patch('/admin/:id/estado', waiterMiddleware, controladorReserva.actualizarEstadoAdmin);

module.exports = enrutador;