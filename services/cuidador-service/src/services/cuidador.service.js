const model = require("../models/cuidador.model");

/* ── Obtener perfil completo ── */
const obtenerPerfil = async (usuarioId) => {
  let perfil = await model.obtenerPerfil(usuarioId);

  // Si existe en usuarios pero no tiene registro en perfil_cuidador, crearlo
  if (perfil && !perfil.usuario_id) {
    await model.crearPerfil(usuarioId);
    perfil = await model.obtenerPerfil(usuarioId);
  }

  return perfil || null;
};

/* ── Actualizar datos generales ── */
const actualizarPerfil = async (usuarioId, body) => {
  const perfil = await model.actualizarPerfil(usuarioId, body);
  if (!perfil) throw new Error("Perfil no encontrado");
  return perfil;
};

/* ── Cambiar disponibilidad ── */
const cambiarDisponibilidad = async (usuarioId, disponible) => {
  if (typeof disponible !== "boolean") throw new Error("disponible debe ser true o false");
  return await model.cambiarDisponibilidad(usuarioId, disponible);
};

/* ── Actualizar imagen ── */
const actualizarImagen = async (usuarioId, campo, filename) => {
  const ruta = `/uploads/${filename}`;
  return await model.actualizarImagen(usuarioId, campo, ruta);
};

/* ── Buscar por ciudad ── */
const buscarPorCiudad = async (ciudad) => {
  if (!ciudad || ciudad.trim() === "") throw new Error("La ciudad es requerida");
  return await model.buscarPorCiudad(ciudad.trim());
};

/* ── Perfil público ── */
const obtenerPerfilPublico = async (usuarioId) => {
  const perfil = await model.obtenerPerfilPublico(usuarioId);
  if (!perfil) throw new Error("Cuidador no encontrado");
  return perfil;
};

/* ── Reseñas ── */
const obtenerResenas = async (proveedorId) => {
  return await model.obtenerResenas(proveedorId);
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  cambiarDisponibilidad,
  actualizarImagen,
  buscarPorCiudad,
  obtenerPerfilPublico,
  obtenerResenas,
};