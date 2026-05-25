const express        = require('express');
const router         = express.Router();
const controller     = require('../controllers/tracking.controller');
const verificarToken = require('../middlewares/auth.middleware');

/* Paseador — iniciar paseo */
router.post('/:solicitudId/iniciar',    verificarToken, controller.iniciarPaseo);

/* Paseador — enviar ubicación */
router.post('/:solicitudId/ubicacion',  verificarToken, controller.guardarUbicacion);

/* Dueño — consultar ubicación */
router.get('/:solicitudId/ubicacion',   verificarToken, controller.obtenerUbicacion);

/* Paseador — finalizar paseo */
router.post('/:solicitudId/finalizar',  verificarToken, controller.finalizarPaseo);

module.exports = router;