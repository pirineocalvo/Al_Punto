const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const { waiterMiddleware } = require('../middlewares/authMiddleware.js');

router.get('/items', marketController.getItems);
router.get('/mypocket', marketController.getMyPocket);
router.post('/comprar/:id', marketController.buyItem);
router.get('/pocket/:userId/use/:tokenUrl', waiterMiddleware, marketController.getPocketToken);
router.post('/pocket/:userId/use/:tokenUrl', waiterMiddleware, marketController.usePocketToken);

module.exports = router;
