const express = require('express');
const router = express.Router();
const ResenaController = require('../controllers/resenas.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Crear reseña (protegida)
router.post('/', authMiddleware, ResenaController.crearResena);

// Obtener servicios calificables para el usuario autenticado
router.get('/calificables', authMiddleware, ResenaController.obtenerServiciosCalificables);

// Obtener reseñas de un proveedor (pública)
router.get('/:id_usuario', ResenaController.obtenerResenas);

// Obtener promedio de calificaciones (pública)
router.get('/promedio/:id_usuario', ResenaController.obtenerPromedio);

module.exports = router;
