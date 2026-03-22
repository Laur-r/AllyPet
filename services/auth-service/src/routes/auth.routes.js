const express = require('express');
const router = express.Router();

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({ message: 'Auth Service rutas funcionando 🔐' });
});

module.exports = router;
