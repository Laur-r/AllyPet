const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const resenasRoutes = require('./routes/resenas.routes');
app.use('/api/resenas', resenasRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Review Service funcionando ⭐');
});

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
  console.log(`Review Service corriendo en http://localhost:${PORT}`);
});
