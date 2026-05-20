const express        = require("express");
const router         = express.Router();
const controller     = require("../controllers/solicitud.controller");
const verificarToken = require("../middlewares/auth.middleware");

/* H5.1 — Crear solicitud */
router.post("/", verificarToken, controller.crearSolicitud);

/* H5.2 — Solicitudes pendientes del paseador */
router.get("/paseador/pendientes", verificarToken, controller.obtenerSolicitudesPendientes);

/* H5.2 — Aceptar o rechazar */
router.put("/:id/responder", verificarToken, controller.responderSolicitud);

/* H5.3 — Cancelar solicitud */
router.put("/:id/cancelar", verificarToken, controller.cancelarSolicitud);

/* H5.4 — Historial del dueño */
router.get("/dueno/historial", verificarToken, controller.obtenerHistorialDueno);

/* H5.5 — Historial del paseador */
router.get("/paseador/historial", verificarToken, controller.obtenerHistorialPaseador);

/* H5.6 — Marcar como completado */
router.put("/:id/completar", verificarToken, controller.completarServicio);

/* Veterinario — Crear solicitud de consulta */
router.post("/veterinario", verificarToken, controller.crearSolicitudVet);

/* Veterinario — Ver pendientes */
router.get("/veterinario/pendientes", verificarToken, controller.obtenerSolicitudesVetPendientes);

/* Veterinario — Aceptar o rechazar */
router.put("/:id/responder-vet", verificarToken, controller.responderSolicitudVet);

/* Dueño — Historial de consultas vet */
router.get("/veterinario/historial", verificarToken, controller.obtenerHistorialVetDueno);

module.exports = router;