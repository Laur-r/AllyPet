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
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('User Service funcionando 👤');
});

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`User Service corriendo en http://localhost:${PORT}`);
});