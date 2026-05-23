const express = require('express');
const enrutador = express.Router();
const controladorUsuario = require('../controllers/usuarioController');
const { authMiddleware } = require('../middlewares/authMiddleware');

enrutador.post('/iniciarSesion', controladorUsuario.iniciarSesion);
enrutador.post('/registrar', controladorUsuario.registrar);
enrutador.get('/informacion', authMiddleware, controladorUsuario.obtenerInformacion);
enrutador.get('/transacciones', authMiddleware, controladorUsuario.obtenerTransacciones);
enrutador.get('/niveles', controladorUsuario.obtenerNiveles);
enrutador.put('/perfil', authMiddleware, controladorUsuario.actualizarPerfil);
enrutador.put('/contrasena', authMiddleware, controladorUsuario.actualizarContrasena);
enrutador.get('/checkin/:id', controladorUsuario.checkin);

module.exports = enrutador;