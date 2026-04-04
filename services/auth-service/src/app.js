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
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Auth Service funcionando 🔐');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Auth Service corriendo en http://localhost:${PORT}`);
});