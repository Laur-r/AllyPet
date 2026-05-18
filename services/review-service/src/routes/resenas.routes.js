const express = require('express');
const router = express.Router();
const ResenaController = require('../controllers/resenas.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, ResenaController.crearResena);

router.get('/calificables', authMiddleware, ResenaController.obtenerServiciosCalificables);
/* H11.6 — Servicios de cuidado calificables */
router.get('/calificables/cuidado', authMiddleware, ResenaController.obtenerServiciosCuidadoCalificables);

router.get('/promedio/:id_usuario', ResenaController.obtenerPromedio);
router.get('/:id_usuario', ResenaController.obtenerResenas);

module.exports = router;