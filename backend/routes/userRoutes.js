const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/userInfo', authMiddleware, userController.getUserInfo);
router.get('/transactions', authMiddleware, userController.getTransactions);
router.get('/levels', userController.getLevels);
router.put('/perfil', authMiddleware, userController.updatePerfil);
router.put('/password', authMiddleware, userController.updatePassword);

module.exports = router;