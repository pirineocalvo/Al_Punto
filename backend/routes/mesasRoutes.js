const express = require('express');
const router = express.Router();
const mesasController = require('../controllers/mesasController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

router.get('/disponibilidad-mes', authMiddleware, mesasController.getDisponibilidadMes);
router.get('/disponibilidad-dia', authMiddleware, mesasController.getDisponibilidadDia);
router.post('/reservar', authMiddleware, mesasController.reservarMesa);
router.get('/admin/todas', authMiddleware, adminMiddleware, mesasController.getTodasMesas);
router.post('/admin/crear', authMiddleware, adminMiddleware, mesasController.crearMesa);
router.put('/admin/:id', authMiddleware, adminMiddleware, mesasController.actualizarMesa);
router.delete('/admin/:id', authMiddleware, adminMiddleware, mesasController.desactivarMesa);

module.exports = router;