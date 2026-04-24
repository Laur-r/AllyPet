const model = require('../models/vet.model');

const VetModel = require('../models/vet.model');

const getPerfil = async (usuario_id) => {
  let perfil = await VetModel.getByUsuario(usuario_id);

  if (!perfil) {
    perfil = await VetModel.create(usuario_id);
  }

  //  PARCHE CLAVE
  if (perfil.servicios && typeof perfil.servicios === 'string') {
    try { perfil.servicios = JSON.parse(perfil.servicios); } catch { perfil.servicios = []; }
  }

  if (perfil.horarios && typeof perfil.horarios === 'string') {
    try { perfil.horarios = JSON.parse(perfil.horarios); } catch { perfil.horarios = {}; }
  }

  return perfil;
};

module.exports = { getPerfil };

const actualizarPerfil = async (usuario_id, datos) => {
  if (!usuario_id) {
    throw new Error('usuario_id requerido');
  }

  const perfil = await model.update(usuario_id, datos);
  return perfil;
};

/* ──  Buscar veterinarias por ciudad ── */
const buscarPorCiudad = async (ciudad) => {
  if (!ciudad || ciudad.trim() === '') {
    throw new Error('La ciudad es requerida');
  }
  const veterinarias = await model.buscarPorCiudad(ciudad.trim());
  return veterinarias;
};

/* ── Obtener perfil público veterinaria ── */
const obtenerPerfilPublico = async (usuario_id) => {
  const perfil = await model.obtenerPerfilPublico(usuario_id);
  if (!perfil) throw new Error('Veterinaria no encontrada o no disponible');

  if (typeof perfil.servicios === 'string') {
    try { perfil.servicios = JSON.parse(perfil.servicios); } catch { perfil.servicios = []; }
  }
  if (typeof perfil.horarios === 'string') {
    try { perfil.horarios = JSON.parse(perfil.horarios); } catch { perfil.horarios = {}; }
  }

  return perfil;
};

/* ── Obtener reseñas de la veterinaria ── */
const obtenerResenas = async (proveedorId) => {
  return await model.obtenerResenas(proveedorId);
};

module.exports = {
  getPerfil,
  actualizarPerfil,
  buscarPorCiudad,
  obtenerPerfilPublico,
  obtenerResenas,
};