const express        = require("express");
const router         = express.Router();
const controller     = require("../controllers/cuidador.controller");
const verificarToken = require("../middlewares/auth.middleware");
const upload         = require("../middlewares/upload.middleware");

/* ── Rutas públicas ── */
router.get("/buscar",              controller.buscarPorCiudad);
router.get("/publico/:usuarioId",  controller.obtenerPerfilPublico);
router.get("/:usuarioId/resenas",  controller.obtenerResenas);

/* ── Perfil privado ── */
router.get("/:usuarioId",          verificarToken, controller.obtenerPerfil);

/* ── Actualizar datos generales (descripcion, tarifa, ciudad, disponibilidad, foto, etc.) ── */
router.put("/:usuarioId",          verificarToken, controller.actualizarPerfil);

/* ── Toggle disponibilidad ── */
router.patch("/:usuarioId/disponibilidad", verificarToken, controller.cambiarDisponibilidad);

/* ── Subir imágenes ── */
router.post(
  "/:usuarioId/imagen/:campo",
  verificarToken,
  upload.single("imagen"),
  controller.subirImagen
);

module.exports = router;