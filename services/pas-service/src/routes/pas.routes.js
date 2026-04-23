const express        = require("express");
const router         = express.Router();
const controller     = require("../controllers/pas.controller");
const verificarToken = require("../middlewares/auth.middleware");
const upload         = require("../middlewares/upload.middleware");

/* ── Buscar paseadores por ciudad (pública) ── */
router.get("/buscar", controller.buscarPorCiudad);

/* ── Perfil público del paseador (pública) ── */
router.get("/publico/:usuarioId", controller.obtenerPerfilPublico);

/* ── Reseñas del paseador (pública) ── */
router.get("/:usuarioId/resenas", controller.obtenerResenas);

/* ── Perfil completo ── */
router.get("/:usuarioId",                        verificarToken, controller.obtenerPerfil);

/* ── Datos generales (nombre, ciudad, experiencia, etc.) ── */
router.put("/:usuarioId",                        verificarToken, controller.actualizarPerfil);

/* ── Arrays JSONB ── */
router.put("/:usuarioId/servicios",              verificarToken, controller.actualizarServicios);
router.put("/:usuarioId/zonas",                  verificarToken, controller.actualizarZonas);
router.put("/:usuarioId/razas",                  verificarToken, controller.actualizarRazas);

/* ── Disponibilidad (toggle rápido) ── */
router.patch("/:usuarioId/disponibilidad",       verificarToken, controller.cambiarDisponibilidad);

/* ── Imágenes ── */
router.post(
  "/:usuarioId/imagen/:campo",
  verificarToken,
  upload.single("imagen"),
  controller.subirImagen
);

module.exports = router;