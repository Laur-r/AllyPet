const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas (CORREGIDO)
const adminRoutes = require('./routes/admin.routes');
app.use('/api/admin', adminRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Admin Service funcionando ⚙️');
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Admin Service corriendo en http://localhost:${PORT}`);
});