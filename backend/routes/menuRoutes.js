const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { adminMiddleware } = require('../middlewares/authMiddleware');

router.get('/', menuController.getAllItems);
router.get('/categorias', menuController.getCategories);
router.get('/:idcategory', menuController.getItemsByCategory);
router.post('/', adminMiddleware, menuController.createItem);
router.post('/addcategory', adminMiddleware, menuController.createCategory);
router.post('/update', adminMiddleware, menuController.updateItem);

module.exports = router;