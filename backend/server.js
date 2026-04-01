const express = require('express');
require('dotenv').config();
const cors = require('cors');
const http = require('http');
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reserveRoutes = require('./routes/reserveRoutes.js');
const ticketsRoutes = require('./routes/ticketsRoutes.js');
const reseniasRoutes = require('./routes/reseniasRoutes.js');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservas', reserveRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/resenias', reseniasRoutes);
app.use('/uploads', express.static('uploads'));
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
