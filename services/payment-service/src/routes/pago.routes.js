const express        = require('express');
const router         = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const controller     = require('../controllers/pago.controller');

/* ── Pública: webhook de Wompi (sin token JWT) ── */
router.post('/webhook', controller.webhook);

/* ── Protegidas ── */
router.use(verificarToken);

/* Dueño inicia el pago tras solicitud aceptada */
router.post('/iniciar', controller.iniciarPago);

/* Dueño o proveedor consulta estado de un pago */
router.get('/consultar/:referencia', controller.consultarPago);

/* Proveedor: historial de pagos recibidos */
router.get('/proveedor/historial', controller.getHistorialProveedor);

/* Proveedor: resumen financiero (mes, histórico, pendiente) */
router.get('/proveedor/resumen', controller.getResumenProveedor);

module.exports = router;