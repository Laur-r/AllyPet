const express = require('express');
const router = express.Router();
const ResenaController = require('../controllers/resenas.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, ResenaController.crearResena);

router.get('/calificables', authMiddleware, ResenaController.obtenerServiciosCalificables);

router.get('/promedio/:id_usuario', ResenaController.obtenerPromedio);
router.get('/:id_usuario', ResenaController.obtenerResenas);

module.exports = router;