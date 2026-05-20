const PetService = require('../services/pet.service');
const petModel = require('../models/pet.model');

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

// Galería de fotos
const getGaleria = async (req, res) => {
    try {
        const { id } = req.params;
        // ✅ Usamos el modelo en lugar de pool directo
        const fotos = await petModel.getGaleriaByMascotaId(id);
        res.json({ ok: true, data: fotos });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al obtener galería' });
    }
};

const subirAFotoGaleria = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ ok: false, message: 'Falta la imagen' });
        
        const foto_url = `/uploads/${req.file.filename}`;
        // ✅ Usamos el modelo
        const nuevaFoto = await petModel.addFotoGaleria(id, foto_url);
        res.json({ ok: true, data: nuevaFoto });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al subir foto' });
    }
};

const eliminarFotoGaleria = async (req, res) => {
    try {
        const { fotoId } = req.params;
        // ✅ Usamos el modelo
        await petModel.deleteFotoGaleria(fotoId);
        res.json({ ok: true, message: 'Foto eliminada' });
    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error al eliminar foto' });
    }
};

module.exports = { getMascotas, getMascota, crearMascota, actualizarMascota, eliminarMascota, getGaleria, subirAFotoGaleria,eliminarFotoGaleria };