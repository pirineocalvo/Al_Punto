const express = require('express');
const router = express.Router();
const ticketsController = require('../controllers/ticketsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../config/ticketUpload');

router.post('/upload', authMiddleware, upload.single('imagen'), ticketsController.uploadTicket);
router.get('/mytickets', authMiddleware, ticketsController.getMyTickets);

module.exports = router;