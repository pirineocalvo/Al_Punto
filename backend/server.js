const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const rutasUsuario = require('./routes/usuarioRoutes.js');
const rutasMenu = require('./routes/menuRoutes');
const rutasReservas = require('./routes/reservaRoutes.js');
const rutasTickets = require('./routes/ticketsRoutes.js');
const rutasMercado = require('./routes/mercadoRoutes.js');
const rutasResenias = require('./routes/comentarioRoutes.js');
const rutasPedidos = require('./routes/pedidoRoutes.js');
const rutasMesas = require('./routes/mesaRoutes.js');

const aplicacion = express();
const PUERTO = process.env.PORT;

aplicacion.use(cors());
aplicacion.use(express.json());

aplicacion.use('/api/usuario', rutasUsuario);
aplicacion.use('/api/menu', rutasMenu);
aplicacion.use('/api/reservas', rutasReservas);
aplicacion.use('/api/tickets', rutasTickets);
aplicacion.use('/api/marketplace', rutasMercado);
aplicacion.use('/api/resenias', rutasResenias);
aplicacion.use('/api/orders', rutasPedidos);
aplicacion.use('/api/mesas', rutasMesas);
aplicacion.use('/uploads', express.static('uploads'));

aplicacion.listen(PUERTO, () => {
    console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});