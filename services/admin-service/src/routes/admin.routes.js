const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middlewares/jwt.middleware');

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({ message: 'Admin Service rutas funcionando 🔩' });
});

// Dashboard y listados
router.get('/dashboard', requireAdmin, adminController.getDashboard);
router.get('/users', requireAdmin, adminController.getUsers);

// Acciones de usuarios
router.patch('/users/:id/activate', requireAdmin, adminController.activateUser);
router.patch('/users/:id/deactivate', requireAdmin, adminController.deactivateUser);

// Aprobación de proveedores
router.patch('/paseador/:id/aprobar',      requireAdmin, adminController.aprobarPaseador);
router.patch('/paseador/:id/desaprobar',   requireAdmin, adminController.desaprobarPaseador);
router.patch('/veterinario/:id/aprobar',   requireAdmin, adminController.aprobarVeterinario);
router.patch('/veterinario/:id/desaprobar',requireAdmin, adminController.desaprobarVeterinario);

module.exports = router;

