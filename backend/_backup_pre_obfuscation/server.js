const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const reserveRoutes = require('./routes/reserveRoutes.js');
const ticketsRoutes = require('./routes/ticketsRoutes.js');
const marketRoutes = require('./routes/marketRoutes.js');
const reseniasRoutes = require('./routes/reseniasRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const mesasRoutes = require('./routes/mesasRoutes.js');
const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  const allowlist = corsOrigin.split(',').map(s => s.trim()).filter(Boolean);
  app.use(cors({ origin: allowlist, credentials: true }));
} else {
  app.use(cors());
}

app.use(express.json());
app.use('/api/user', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/reservas', reserveRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/marketplace', marketRoutes);
app.use('/api/resenias', reseniasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
