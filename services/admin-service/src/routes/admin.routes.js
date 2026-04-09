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
router.put('/users/:id/approve', requireAdmin, adminController.approveUser);
router.put('/users/:id/reject', requireAdmin, adminController.rejectUser);
router.patch('/users/:id/activate', requireAdmin, adminController.activateUser);
router.patch('/users/:id/deactivate', requireAdmin, adminController.deactivateUser);

module.exports = router;

