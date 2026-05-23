const express = require('express');
const enrutador = express.Router();
const controladorTickets = require('../controllers/ticketsController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const subida = require('../config/subidaTicket');

enrutador.post('/subir', authMiddleware, subida.single('imagen'), controladorTickets.subirTicket);
enrutador.get('/misTickets', authMiddleware, controladorTickets.obtenerMisTickets);

module.exports = enrutador;