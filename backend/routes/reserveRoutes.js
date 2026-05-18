const express = require('express');
const router = express.Router();
const reserveController = require('../controllers/reserveController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

router.post('/addreserve', authMiddleware, reserveController.addReserve);
router.get('/userReserve', authMiddleware, reserveController.getUserReserves);
router.delete('/cancelar/:id', authMiddleware, reserveController.cancelarReserva);
router.get('/admin/allReserve', authMiddleware, adminMiddleware, reserveController.getAllReservesAdmin);
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, reserveController.updateStatusAdmin);

module.exports = router;