const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // ← aquí

const petRoutes = require('./routes/pet.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (fotos subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/pets', petRoutes);

// Health check
app.get('/health', (req, res) => res.json({ ok: true, service: 'pet-service' }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🐾 pet-service corriendo en puerto ${PORT}`);
});

module.exports = app;