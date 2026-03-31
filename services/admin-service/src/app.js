const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Conexión a la base de datos
require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Admin Service funcionando 🛡️');
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Admin Service corriendo en http://localhost:${PORT}`);
});