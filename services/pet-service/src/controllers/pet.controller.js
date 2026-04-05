const PetService = require('../services/pet.service');

const getMascotas = async (req, res) => {
  try {
    const mascotas = await PetService.getMascotas(req.usuario_id);
    res.json({ ok: true, data: mascotas });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

const getMascota = async (req, res) => {
  try {
    const mascota = await PetService.getMascota(req.params.id, req.usuario_id);
    res.json({ ok: true, data: mascota });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

const crearMascota = async (req, res) => {
  try {
    const nueva = await PetService.crearMascota(req.usuario_id, req.body);
    res.status(201).json({ ok: true, data: nueva });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

const actualizarMascota = async (req, res) => {
  try {
    const actualizada = await PetService.actualizarMascota(req.params.id, req.usuario_id, req.body);
    res.json({ ok: true, data: actualizada });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

const eliminarMascota = async (req, res) => {
  try {
    await PetService.eliminarMascota(req.params.id, req.usuario_id);
    res.json({ ok: true, message: 'Mascota eliminada correctamente' });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

module.exports = { getMascotas, getMascota, crearMascota, actualizarMascota, eliminarMascota };