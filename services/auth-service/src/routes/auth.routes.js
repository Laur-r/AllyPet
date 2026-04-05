const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({ message: 'Auth Service rutas funcionando' });
});

// Login
router.post('/login', authController.login);

// Registro
router.post('/register/dueno',       authController.registrarDueno);
router.post('/register/paseador',    authController.registrarPaseador);
router.post('/register/veterinario', authController.registrarVeterinario);

module.exports = router;