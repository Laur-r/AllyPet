const service = require("../services/cuidador.service");

/* ─────────────────────────────────────────
   GET /api/perfil-cuidador/:usuarioId
───────────────────────────────────────── */
const obtenerPerfil = async (req, res) => {
  try {
    const perfil = await service.obtenerPerfil(req.params.usuarioId);
    if (!perfil) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(perfil);
  } catch (err) {
    console.error("obtenerPerfil:", err.message);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
};

/* ─────────────────────────────────────────
   PUT /api/perfil-cuidador/:usuarioId
   Actualiza: nombre, descripcion, tarifa,
              disponibilidad, ciudad, estado,
              especialidad, experiencia, disponible
   NO permite: correo, rol
───────────────────────────────────────── */
const actualizarPerfil = async (req, res) => {
  try {
    // Eliminar campos prohibidos del body aunque lleguen
    const { correo, rol, ...camposPermitidos } = req.body;

    const perfil = await service.actualizarPerfil(req.params.usuarioId, camposPermitidos);
    res.json({ message: "Perfil actualizado", perfil });
  } catch (err) {
    console.error("actualizarPerfil:", err.message);
    res.status(err.message === "Perfil no encontrado" ? 404 : 500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   PATCH /api/perfil-cuidador/:usuarioId/disponibilidad
   Body: { disponible: true | false }
───────────────────────────────────────── */
const cambiarDisponibilidad = async (req, res) => {
  try {
    const { disponible } = req.body;
    const resultado = await service.cambiarDisponibilidad(req.params.usuarioId, disponible);
    if (!resultado) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json({ message: "Disponibilidad actualizada", disponible: resultado.disponible });
  } catch (err) {
    console.error("cambiarDisponibilidad:", err.message);
    res.status(400).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   POST /api/perfil-cuidador/:usuarioId/imagen/:campo
   campo: "foto_perfil" | "banner"
   multipart/form-data — campo file: "imagen"
───────────────────────────────────────── */
const subirImagen = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se recibió ninguna imagen" });

    const { usuarioId, campo } = req.params;
    const resultado = await service.actualizarImagen(usuarioId, campo, req.file.filename);

    if (!resultado) return res.status(400).json({ error: "Campo de imagen inválido" });

    res.json({
      message: "Imagen actualizada",
      campo,
      url: `/uploads/${req.file.filename}`,
    });
  } catch (err) {
    console.error("subirImagen:", err.message);
    res.status(500).json({ error: "Error al subir imagen" });
  }
};

/* ─────────────────────────────────────────
   GET /api/perfil-cuidador/buscar?ciudad=Cali
───────────────────────────────────────── */
const buscarPorCiudad = async (req, res) => {
  try {
    const { ciudad } = req.query;
    const cuidadores = await service.buscarPorCiudad(ciudad || '');
    return res.status(200).json({
      message: cuidadores.length ? "Cuidadores encontrados" : "No se encontraron cuidadores",
      data: cuidadores,
    });
  } catch (err) {
    console.error("buscarPorCiudad:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

/* ─────────────────────────────────────────
   GET /api/perfil-cuidador/publico/:usuarioId
───────────────────────────────────────── */
const obtenerPerfilPublico = async (req, res) => {
  try {
    const perfil = await service.obtenerPerfilPublico(req.params.usuarioId);
    return res.status(200).json(perfil);
  } catch (err) {
    console.error("obtenerPerfilPublico:", err.message);
    const status = err.message === "Cuidador no encontrado" ? 404 : 500;
    return res.status(status).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   GET /api/perfil-cuidador/:usuarioId/resenas
───────────────────────────────────────── */
const obtenerResenas = async (req, res) => {
  try {
    const resenas = await service.obtenerResenas(req.params.usuarioId);
    return res.status(200).json({ message: "Reseñas encontradas", data: resenas });
  } catch (err) {
    console.error("obtenerResenas:", err.message);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  cambiarDisponibilidad,
  subirImagen,
  buscarPorCiudad,
  obtenerPerfilPublico,
  obtenerResenas,
};