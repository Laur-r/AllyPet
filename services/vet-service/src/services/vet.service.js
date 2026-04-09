const model = require('../models/vet.model');

const VetModel = require('../models/vet.model');

const getPerfil = async (usuario_id) => {
  let perfil = await VetModel.getByUsuario(usuario_id);

  if (!perfil) {
    perfil = await VetModel.create(usuario_id);
  }

  // 🔥 PARCHE CLAVE
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

module.exports = {
  getPerfil,
  actualizarPerfil
};