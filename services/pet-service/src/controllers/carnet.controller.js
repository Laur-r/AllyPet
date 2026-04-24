const CarnetService = require('../services/carnet.service');

// ─── CARNET ──────────────────────────────────────────────────────
const getCarnet = async (req, res) => {
  try {
    const data = await CarnetService.getCarnetCompleto(req.params.petId, req.usuario_id);
    res.json({ ok: true, data });
  } catch (err) {
    console.error('ERROR CARNET:', err);
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

const getCarnetPublico = async (req, res) => {
  try {
    const data = await CarnetService.getCarnetPublico(req.params.token);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

// ─── VACUNAS ─────────────────────────────────────────────────────
const agregarVacuna = async (req, res) => {
  try {
    const data = await CarnetService.agregarVacuna(req.params.petId, req.usuario_id, req.body);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

const editarVacuna = async (req, res) => {
  try {
    const data = await CarnetService.editarVacuna(req.params.petId, req.usuario_id, req.params.vacunaId, req.body);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

const eliminarVacuna = async (req, res) => {
  try {
    await CarnetService.eliminarVacuna(req.params.petId, req.usuario_id, req.params.vacunaId);
    res.json({ ok: true, message: 'Vacuna eliminada correctamente' });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

// ─── HISTORIAL ───────────────────────────────────────────────────
const agregarHistorial = async (req, res) => {
  try {
    const data = await CarnetService.agregarHistorial(req.params.petId, req.usuario_id, req.body);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

const eliminarHistorial = async (req, res) => {
  try {
    await CarnetService.eliminarHistorial(req.params.petId, req.usuario_id, req.params.entradaId);
    res.json({ ok: true, message: 'Registro eliminado correctamente' });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

// ─── RECORDATORIOS ───────────────────────────────────────────────
const agregarRecordatorio = async (req, res) => {
  try {
    const data = await CarnetService.agregarRecordatorio(req.params.petId, req.usuario_id, req.body);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

const eliminarRecordatorio = async (req, res) => {
  try {
    await CarnetService.eliminarRecordatorio(req.params.petId, req.usuario_id, req.params.recordatorioId);
    res.json({ ok: true, message: 'Recordatorio eliminado correctamente' });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

// ─── TOKEN QR ────────────────────────────────────────────────────
const generarToken = async (req, res) => {
  try {
    const data = await CarnetService.generarToken(req.params.petId, req.usuario_id);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

const revocarToken = async (req, res) => {
  try {
    await CarnetService.revocarToken(req.params.petId, req.usuario_id);
    res.json({ ok: true, message: 'Acceso revocado correctamente' });
  } catch (err) {
    res.status(err.status || 500).json({ ok: false, message: err.message });
  }
};

module.exports = {
  getCarnet, getCarnetPublico,
  agregarVacuna, editarVacuna, eliminarVacuna,
  agregarHistorial, eliminarHistorial,
  agregarRecordatorio, eliminarRecordatorio,
  generarToken, revocarToken
};