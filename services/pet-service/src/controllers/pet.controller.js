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
    const foto = req.file ? `/uploads/${req.file.filename}` : null;
    const data  = { ...req.body, foto };
    const mascota = await PetService.crearMascota(req.usuario_id, data);
    res.json({ ok: true, data: mascota });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, message: 'Error creando mascota' });
  }
};

const actualizarMascota = async (req, res) => {
  try {
    const foto = req.file ? `/uploads/${req.file.filename}` : req.body.foto || null;
    const data  = { ...req.body, foto };
    const actualizada = await PetService.actualizarMascota(req.params.id, req.usuario_id, data);
    res.json({ ok: true, data: actualizada });
  } catch (err) {
    console.error(err);
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