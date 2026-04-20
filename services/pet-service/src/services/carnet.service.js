const CarnetModel = require('../models/carnet.model');
const PetModel    = require('../models/pet.model');

// Verifica que la mascota pertenece al usuario
const verificarPropietario = async (mascota_id, usuario_id) => {
  const mascota = await PetModel.getById(mascota_id, usuario_id);
  if (!mascota) {
    const err = new Error('Mascota no encontrada o no autorizada');
    err.status = 404;
    throw err;
  }
  return mascota;
};

// ─── CARNET ──────────────────────────────────────────────────────
const getCarnetCompleto = async (mascota_id, usuario_id) => {
  await verificarPropietario(mascota_id, usuario_id);
  const [carnet, vacunas, historial, recordatorios, tokenData] = await Promise.all([
    CarnetModel.getCarnet(mascota_id),
    CarnetModel.getVacunas(mascota_id),
    CarnetModel.getHistorial(mascota_id),
    CarnetModel.getRecordatorios(mascota_id),
    CarnetModel.getToken(mascota_id)
  ]);
  return { ...carnet, vacunas, historial, recordatorios, token: tokenData?.token || null };
};

const getCarnetPublico = async (token) => {
  const data = await CarnetModel.getCarnetByToken(token);
  if (!data) {
    const err = new Error('Carnet no encontrado o enlace inválido');
    err.status = 404;
    throw err;
  }
  const [vacunas, historial] = await Promise.all([
    CarnetModel.getVacunas(data.id),
    CarnetModel.getHistorial(data.id)
  ]);
  return { ...data, vacunas, historial };
};

// ─── VACUNAS ─────────────────────────────────────────────────────
const agregarVacuna = async (mascota_id, usuario_id, datos) => {
  await verificarPropietario(mascota_id, usuario_id);
  return CarnetModel.createVacuna({ ...datos, mascota_id });
};

const editarVacuna = async (mascota_id, usuario_id, vacuna_id, datos) => {
  await verificarPropietario(mascota_id, usuario_id);
  const vacuna = await CarnetModel.updateVacuna(vacuna_id, mascota_id, datos);
  if (!vacuna) {
    const err = new Error('Vacuna no encontrada');
    err.status = 404;
    throw err;
  }
  return vacuna;
};

const eliminarVacuna = async (mascota_id, usuario_id, vacuna_id) => {
  await verificarPropietario(mascota_id, usuario_id);
  const ok = await CarnetModel.deleteVacuna(vacuna_id, mascota_id);
  if (!ok) {
    const err = new Error('Vacuna no encontrada');
    err.status = 404;
    throw err;
  }
};

// ─── HISTORIAL ───────────────────────────────────────────────────
const agregarHistorial = async (mascota_id, usuario_id, datos) => {
  await verificarPropietario(mascota_id, usuario_id);
  return CarnetModel.createHistorial({ ...datos, mascota_id });
};

const eliminarHistorial = async (mascota_id, usuario_id, entrada_id) => {
  await verificarPropietario(mascota_id, usuario_id);
  const ok = await CarnetModel.deleteHistorial(entrada_id, mascota_id);
  if (!ok) {
    const err = new Error('Registro no encontrado');
    err.status = 404;
    throw err;
  }
};

// ─── RECORDATORIOS ───────────────────────────────────────────────
const agregarRecordatorio = async (mascota_id, usuario_id, datos) => {
  await verificarPropietario(mascota_id, usuario_id);
  return CarnetModel.createRecordatorio({ ...datos, mascota_id });
};

const eliminarRecordatorio = async (mascota_id, usuario_id, recordatorio_id) => {
  await verificarPropietario(mascota_id, usuario_id);
  const ok = await CarnetModel.deleteRecordatorio(recordatorio_id, mascota_id);
  if (!ok) {
    const err = new Error('Recordatorio no encontrado');
    err.status = 404;
    throw err;
  }
};

// ─── TOKEN QR ────────────────────────────────────────────────────
const generarToken = async (mascota_id, usuario_id) => {
  await verificarPropietario(mascota_id, usuario_id);
  return CarnetModel.createToken(mascota_id);
};

const revocarToken = async (mascota_id, usuario_id) => {
  await verificarPropietario(mascota_id, usuario_id);
  return CarnetModel.revokeToken(mascota_id);
};

module.exports = {
  getCarnetCompleto, getCarnetPublico,
  agregarVacuna, editarVacuna, eliminarVacuna,
  agregarHistorial, eliminarHistorial,
  agregarRecordatorio, eliminarRecordatorio,
  generarToken, revocarToken
};