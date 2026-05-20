const PetModel = require('../models/pet.model');

const getMascotas = async (usuario_id) => {
  return await PetModel.getByUsuario(usuario_id);
};

const getMascota = async (id, usuario_id) => {
  const mascota = await PetModel.getById(id, usuario_id);
  if (!mascota) throw { status: 404, message: 'Mascota no encontrada' };
  return mascota;
};

const crearMascota = async (usuario_id, datos) => {
  const { nombre, raza } = datos;
  if (!nombre || !raza) throw { status: 400, message: 'Nombre y raza son obligatorios' };
  return await PetModel.create({ usuario_id, ...datos });
};

const actualizarMascota = async (id, usuario_id, datos) => {
  const { nombre, raza } = datos;
  if (!nombre || !raza) throw { status: 400, message: 'Nombre y raza son obligatorios' };

  const existe = await PetModel.getById(id, usuario_id);
  if (!existe) throw { status: 404, message: 'Mascota no encontrada' };

  return await PetModel.update(id, usuario_id, datos);
};

const eliminarMascota = async (id, usuario_id) => {
  const existe = await PetModel.getById(id, usuario_id);
  if (!existe) throw { status: 404, message: 'Mascota no encontrada' };

  await PetModel.remove(id, usuario_id);
};

module.exports = { getMascotas, getMascota, crearMascota, actualizarMascota, eliminarMascota };