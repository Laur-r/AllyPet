const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({ message: 'Auth Service rutas funcionando' });
});

module.exports = router;
