const express = require('express');
const enrutador = express.Router();
const controladorMenu = require('../controllers/menuController');
const { adminMiddleware } = require('../middlewares/authMiddleware');

enrutador.get('/', controladorMenu.obtenerTodosItems);
enrutador.get('/categorias', controladorMenu.obtenerCategorias);
enrutador.get('/:idcategory', controladorMenu.obtenerItemsPorCategoria);
enrutador.post('/agregar', adminMiddleware, controladorMenu.crearItem);
enrutador.post('/agregarCategoria', adminMiddleware, controladorMenu.crearCategoria);
enrutador.post('/actualizar', adminMiddleware, controladorMenu.actualizarItem);

module.exports = enrutador;