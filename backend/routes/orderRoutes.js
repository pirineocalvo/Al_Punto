const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

router.post('/create', authMiddleware, orderController.createOrder);
router.get('/mis-pedidos', authMiddleware, orderController.getMisPedidos);
router.delete('/cancelar/:id', authMiddleware, orderController.cancelarPedido);
router.get('/admin/todos', authMiddleware, adminMiddleware, orderController.getTodosAdmin);
router.patch('/admin/:id/status', authMiddleware, adminMiddleware, orderController.updateStatus);

module.exports = router;