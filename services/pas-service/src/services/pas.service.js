const model = require("../models/pas.model");

/* ── Obtener y normalizar perfil ── */
const obtenerPerfil = async (usuarioId) => {
  const perfil = await model.obtenerPerfil(usuarioId);
  if (!perfil) return null;

  /* Parsear JSONB en caso de que lleguen como string */
  ["servicios", "zonas", "razas"].forEach((campo) => {
    if (typeof perfil[campo] === "string") {
      try { perfil[campo] = JSON.parse(perfil[campo]); }
      catch { perfil[campo] = []; }
    }
    if (!Array.isArray(perfil[campo])) perfil[campo] = [];
  });

  return perfil;
};

/* ── Actualizar datos generales ── */
const actualizarPerfil = async (usuarioId, body) => {
  const perfil = await model.actualizarPerfil(usuarioId, body);
  if (!perfil) throw new Error("Perfil no encontrado");
  return perfil;
};

/* ── Actualizar servicios ── */
const actualizarServicios = async (usuarioId, servicios) => {
  if (!Array.isArray(servicios)) throw new Error("servicios debe ser un array");
  /* Guardar solo nombre, precio e iconKey — sin JSX */
  const limpios = servicios.map(({ nombre, precio, iconKey }) => ({
    nombre: nombre || "",
    precio: precio || "",
    iconKey: iconKey || "paseo",
  }));
  return await model.actualizarServicios(usuarioId, limpios);
};

/* ── Actualizar zonas ── */
const actualizarZonas = async (usuarioId, zonas) => {
  if (!Array.isArray(zonas)) throw new Error("zonas debe ser un array");
  return await model.actualizarZonas(usuarioId, zonas);
};

/* ── Actualizar razas ── */
const actualizarRazas = async (usuarioId, razas) => {
  if (!Array.isArray(razas)) throw new Error("razas debe ser un array");
  return await model.actualizarRazas(usuarioId, razas);
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

/* ──  Buscar paseadores por ciudad ── */
const buscarPorCiudad = async (ciudad) => {
  if (!ciudad || ciudad.trim() === '') {
    throw new Error('La ciudad es requerida');
  }
  const paseadores = await model.buscarPorCiudad(ciudad.trim());
  return paseadores;
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  actualizarServicios,
  actualizarZonas,
  actualizarRazas,
  cambiarDisponibilidad,
  actualizarImagen,
  buscarPorCiudad,
};