const VetService = require('../services/vet.service');

const getPerfil = async (req, res) => {
  try {
    console.log("🚀 ENTRA AL CONTROLLER");

    const perfil = await VetService.getPerfil(req.usuario_id);

    console.log("✅ PERFIL:", perfil);

    res.json({ ok: true, data: perfil });

  } catch (err) {
    console.error("🔥 ERROR REAL BACKEND:", err); // ← ESTE ES EL IMPORTANTE
    res.status(500).json({ ok: false, message: err.message });
  }
};

const actualizarPerfil = async (req, res) => {
  try {console.log('usuario_id:', req.usuario_id);

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
      disponible: req.body.disponible === 'true' || req.body.disponible === true,
      foto_perfil,
      banner,
      servicios,
      horarios,
    };

    const perfil = await VetService.actualizarPerfil(req.usuario_id, datos);

    res.json({ ok: true, data: perfil });

  } catch (err) {
  console.error('❌ ERROR EN CONTROLLER:', err);
  res.status(err.status || 500).json({ ok: false, message: err.message });
}
};
module.exports = { getPerfil, actualizarPerfil };