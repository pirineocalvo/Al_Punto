const express = require('express');
const enrutador = express.Router();
const controladorMercado = require('../controllers/mercadoController.js');
const { waiterMiddleware } = require('../middlewares/authMiddleware.js');

enrutador.get('/productos', controladorMercado.obtenerProductos);
enrutador.get('/miCartera', controladorMercado.obtenerMiCartera);
enrutador.post('/comprar/:id', controladorMercado.comprarProducto);
enrutador.get('/cartera/:idUsuario/usar/:tokenUrl', waiterMiddleware, controladorMercado.obtenerTokenCartera);
enrutador.post('/cartera/:idUsuario/usar/:tokenUrl', waiterMiddleware, controladorMercado.usarTokenCartera);

module.exports = enrutador;