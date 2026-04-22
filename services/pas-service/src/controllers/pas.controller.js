const service = require("../services/pas.service");

/* ─────────────────────────────────────────
   GET /api/perfil-paseador/:usuarioId
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
   PUT /api/perfil-paseador/:usuarioId
   Actualiza: nombre, especialidad, descripcion,
              tarifa, disponibilidad, ciudad, estado,
              experiencia, mascotas_max
───────────────────────────────────────── */
const actualizarPerfil = async (req, res) => {
  try {
    const perfil = await service.actualizarPerfil(req.params.usuarioId, req.body);
    res.json({ message: "Perfil actualizado", perfil });
  } catch (err) {
    console.error("actualizarPerfil:", err.message);
    res.status(err.message === "Perfil no encontrado" ? 404 : 500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   PUT /api/perfil-paseador/:usuarioId/servicios
   Body: { servicios: [{ nombre, precio, iconKey }] }
───────────────────────────────────────── */
const actualizarServicios = async (req, res) => {
  try {
    const servicios = await service.actualizarServicios(req.params.usuarioId, req.body.servicios);
    res.json({ message: "Servicios actualizados", servicios });
  } catch (err) {
    console.error("actualizarServicios:", err.message);
    res.status(400).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   PUT /api/perfil-paseador/:usuarioId/zonas
   Body: { zonas: ["Granada", "El Peñón", ...] }
───────────────────────────────────────── */
const actualizarZonas = async (req, res) => {
  try {
    const zonas = await service.actualizarZonas(req.params.usuarioId, req.body.zonas);
    res.json({ message: "Zonas actualizadas", zonas });
  } catch (err) {
    console.error("actualizarZonas:", err.message);
    res.status(400).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   PUT /api/perfil-paseador/:usuarioId/razas
   Body: { razas: ["Todas las razas", ...] }
───────────────────────────────────────── */
const actualizarRazas = async (req, res) => {
  try {
    const razas = await service.actualizarRazas(req.params.usuarioId, req.body.razas);
    res.json({ message: "Razas actualizadas", razas });
  } catch (err) {
    console.error("actualizarRazas:", err.message);
    res.status(400).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   PATCH /api/perfil-paseador/:usuarioId/disponibilidad
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
   POST /api/perfil-paseador/:usuarioId/imagen/:campo
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
   GET /api/paseador/buscar?ciudad=Medellín
   H6.1 — Buscar paseadores por ciudad
───────────────────────────────────────── */
const buscarPorCiudad = async (req, res) => {
  try {
    const { ciudad } = req.query;

    if (!ciudad || ciudad.trim() === '') {
      return res.status(400).json({ error: 'El parámetro ciudad es requerido' });
    }

    const paseadores = await service.buscarPorCiudad(ciudad);

    if (paseadores.length === 0) {
      return res.status(200).json({
        message: 'No se encontraron paseadores disponibles en esta ciudad',
        data: [],
      });
    }

    return res.status(200).json({
      message: 'Paseadores encontrados',
      data: paseadores,
    });
  } catch (err) {
    console.error('buscarPorCiudad:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  actualizarServicios,
  actualizarZonas,
  actualizarRazas,
  cambiarDisponibilidad,
  subirImagen,
   buscarPorCiudad,
};