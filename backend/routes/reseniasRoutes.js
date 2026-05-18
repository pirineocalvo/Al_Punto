const express = require('express');
const router = express.Router();
const reseniasController = require('../controllers/reseniasController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, reseniasController.createResenia);
router.get('/my-reviews', authMiddleware, reseniasController.getMyReviews);
router.get('/:id_plato', reseniasController.getByPlato);

module.exports = router;