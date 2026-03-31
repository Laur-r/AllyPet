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
const petRoutes = require('./routes/pet.routes');
app.use('/api/pets', petRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Pet Service funcionando 🐾');
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Pet Service corriendo en http://localhost:${PORT}`);
});