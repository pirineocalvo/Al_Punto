const express = require('express');
const enrutador = express.Router();
const controladorMesa = require('../controllers/mesaController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

enrutador.get('/disponibilidad-mes', authMiddleware, controladorMesa.obtenerDisponibilidadMes);
enrutador.get('/disponibilidad-dia', authMiddleware, controladorMesa.obtenerDisponibilidadDia);
enrutador.post('/reservar', authMiddleware, controladorMesa.reservarMesa);
enrutador.get('/admin/todas', authMiddleware, adminMiddleware, controladorMesa.obtenerTodasMesas);
enrutador.post('/admin/crear', authMiddleware, adminMiddleware, controladorMesa.crearMesa);
enrutador.put('/admin/:id', authMiddleware, adminMiddleware, controladorMesa.actualizarMesa);
enrutador.delete('/admin/:id', authMiddleware, adminMiddleware, controladorMesa.desactivarMesa);

module.exports = enrutador;