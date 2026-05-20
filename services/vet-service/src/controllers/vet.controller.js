const VetService = require('../services/vet.service');

/* ── Perfil privado ── */
const getPerfil = async (req, res) => {
  try {
    const perfil = await VetService.getPerfil(req.usuario_id);
    res.json({ ok: true, data: perfil });
  } catch (err) {
    console.error('ERROR REAL BACKEND:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

/* ── Actualizar perfil ── */
const actualizarPerfil = async (req, res) => {
  try {
    const foto_perfil = req.files?.foto_perfil?.[0]
      ? `/uploads/${req.files.foto_perfil[0].filename}`
      : req.body.foto_perfil || null;

    const banner = req.files?.banner?.[0]
      ? `/uploads/${req.files.banner[0].filename}`
      : req.body.banner || null;

    let servicios = [];
    let horarios  = {};
    try { servicios = req.body.servicios ? JSON.parse(req.body.servicios) : []; } catch {}
    try { horarios  = req.body.horarios  ? JSON.parse(req.body.horarios)  : {}; } catch {}

    const datos = {
      ...req.body,
      experiencia: Number(req.body.experiencia) || 0,
      disponible:  req.body.disponible === 'true' || req.body.disponible === true,
      foto_perfil,
      banner,
      servicios,
      horarios,
    };

    const perfil = await VetService.actualizarPerfil(req.usuario_id, datos);
    res.json({ ok: true, data: perfil });
  } catch (err) {
    console.error('ERROR EN CONTROLLER:', err);
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

/* ── Buscar por ciudad ── */
const buscarPorCiudad = async (req, res) => {
  try {
    const { ciudad } = req.query;
    if (!ciudad || ciudad.trim() === '') {
      return res.status(400).json({ error: 'El parámetro ciudad es requerido' });
    }

    const veterinarias = await VetService.buscarPorCiudad(ciudad);

    if (veterinarias.length === 0) {
      return res.status(200).json({
        message: 'No se encontraron veterinarias disponibles en esta ciudad',
        data: [],
      });
    }

    return res.status(200).json({ message: 'Veterinarias encontradas', data: veterinarias });
  } catch (err) {
    console.error('buscarPorCiudad:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* ── Perfil público ── */
const obtenerPerfilPublico = async (req, res) => {
  try {
    const perfil = await VetService.obtenerPerfilPublico(req.params.usuarioId);
    return res.status(200).json(perfil);
  } catch (err) {
    console.error('obtenerPerfilPublico:', err.message);
    const status = err.message === 'Veterinaria no encontrada o no disponible' ? 404 : 500;
    return res.status(status).json({ error: err.message });
  }
};

/* ── Reseñas ── */
const obtenerResenas = async (req, res) => {
  try {
    const resenas = await VetService.obtenerResenas(req.params.usuarioId);
    return res.status(200).json({ message: 'Reseñas encontradas', data: resenas });
  } catch (err) {
    console.error('obtenerResenas:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD
   ───────────────────────────────────────────────────────────────── */

/* GET /perfil-vet/veterinario/citas */
const getCitasDashboard = async (req, res) => {
  try {
    const citas = await VetService.getCitasDashboard(req.usuario_id);
    res.json({ ok: true, data: citas });
  } catch (err) {
    console.error('getCitasDashboard:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

/* GET /perfil-vet/veterinario/pacientes */
const getPacientesDashboard = async (req, res) => {
  try {
    const pacientes = await VetService.getPacientesDashboard(req.usuario_id);
    res.json({ ok: true, data: pacientes });
  } catch (err) {
    console.error('getPacientesDashboard:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

/* GET /perfil-vet/veterinario/dashboard-estadisticas */
const getEstadisticasDashboard = async (req, res) => {
  try {
    const stats = await VetService.getEstadisticasDashboard(req.usuario_id);
    res.json({ ok: true, ...stats });
  } catch (err) {
    console.error('getEstadisticasDashboard:', err);
    res.status(500).json({ ok: false, message: err.message });
  }
};

module.exports = {
  getPerfil,
  actualizarPerfil,
  buscarPorCiudad,
  obtenerPerfilPublico,
  obtenerResenas,
  // dashboard
  getCitasDashboard,
  getPacientesDashboard,
  getEstadisticasDashboard,
};