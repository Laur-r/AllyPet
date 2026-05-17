const model = require("../models/solicitud.model");

const crearSolicitud = async ({ dueno_id, paseador_id, mascota_id, fecha_servicio, hora_servicio, duracion_minutos }) => {
  if (!paseador_id || !mascota_id || !fecha_servicio || !hora_servicio || !duracion_minutos) {
    throw new Error("Todos los campos son requeridos");
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSolicitud = new Date(fecha_servicio + 'T00:00:00'); // ✅ única línea cambiada
  if (fechaSolicitud < hoy) {
    throw new Error("La fecha del servicio no puede ser en el pasado");
  }

  // ... resto del código igual

  const mascota = await model.verificarMascota(mascota_id, dueno_id);
  if (!mascota) {
    throw new Error("La mascota no existe o no te pertenece");
  }

  // Devuelve el id real de perfil_paseador
  const paseador = await model.verificarPaseador(paseador_id);
  if (!paseador) {
    throw new Error("El paseador no existe o no está disponible");
  }

  const solicitud = await model.crearSolicitud({
    dueno_id,
    paseador_id: paseador.id, // ← usa el id real de perfil_paseador
    mascota_id,
    fecha_servicio,
    hora_servicio,
    duracion_minutos,
  });

  return solicitud;
};
const obtenerSolicitudesPendientesPaseador = async (paseador_usuario_id) => {
  return await model.obtenerSolicitudesPendientesPaseador(paseador_usuario_id);
};

const responderSolicitud = async (solicitud_id, paseador_usuario_id, estado) => {
  if (!["aceptada", "rechazada"].includes(estado)) {
    throw new Error("Estado inválido. Debe ser 'aceptada' o 'rechazada'");
  }

  const solicitud = await model.responderSolicitud(solicitud_id, paseador_usuario_id, estado);
  if (!solicitud) {
    throw new Error("Solicitud no encontrada o no puedes modificarla");
  }

  return solicitud;
};
const cancelarSolicitud = async (solicitud_id, dueno_id) => {
  const solicitud = await model.cancelarSolicitud(solicitud_id, dueno_id);
  if (!solicitud) {
    throw new Error("Solicitud no encontrada o no puedes cancelarla");
  }
  return solicitud;
};

const obtenerHistorialDueno = async (dueno_id, estado) => {
  const estadosValidos = ["pendiente", "aceptada", "rechazada", "cancelada", "completada"];
  if (estado && !estadosValidos.includes(estado)) {
    throw new Error("Estado inválido");
  }
  return await model.obtenerHistorialDueno(dueno_id, estado);
};

const obtenerHistorialPaseador = async (paseador_usuario_id, estado) => {
  const estadosValidos = ["pendiente", "aceptada", "rechazada", "cancelada", "completada"];
  if (estado && !estadosValidos.includes(estado)) {
    throw new Error("Estado inválido");
  }
  return await model.obtenerHistorialPaseador(paseador_usuario_id, estado);
};
const completarServicio = async (solicitud_id, paseador_usuario_id) => {
  const solicitud = await model.completarServicio(solicitud_id, paseador_usuario_id);
  if (!solicitud) {
    throw new Error(
      "No se puede completar esta solicitud. Verifica que esté aceptada y que la fecha del servicio ya haya llegado."
    );
  }
  return solicitud;
};

/* ── Crear solicitud de cuidado ── */
const crearSolicitudCuidado = async ({ dueno_id, cuidador_id, mascota_id, fecha_inicio, fecha_fin }) => {
  if (!cuidador_id || !mascota_id || !fecha_inicio || !fecha_fin) {
    throw new Error("Todos los campos son requeridos");
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaInicio = new Date(fecha_inicio + 'T00:00:00');
  const fechaFin    = new Date(fecha_fin    + 'T00:00:00');

  if (fechaInicio < hoy) {
    throw new Error("La fecha de inicio no puede ser en el pasado");
  }

  if (fechaFin <= fechaInicio) {
    throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
  }

  const mascota = await model.verificarMascota(mascota_id, dueno_id);
  if (!mascota) {
    throw new Error("La mascota no existe o no te pertenece");
  }

  const cuidador = await model.verificarCuidador(cuidador_id);
  if (!cuidador) {
    throw new Error("El cuidador no existe o no está disponible");
  }

  const solicitud = await model.crearSolicitudCuidado({
    dueno_id,
    cuidador_id: cuidador.id, // id real de perfil_cuidador
    mascota_id,
    fecha_inicio,
    fecha_fin,
  });

  return solicitud;
};

/* ── Solicitudes pendientes del cuidador ── */
const obtenerSolicitudesPendientesCuidador = async (cuidador_usuario_id) => {
  return await model.obtenerSolicitudesPendientesCuidador(cuidador_usuario_id);
};

/* ── Historial de cuidado del dueño ── */
const obtenerHistorialCuidadoDueno = async (dueno_id, estado) => {
  const estadosValidos = ["pendiente", "aceptada", "rechazada", "cancelada", "completada"];
  if (estado && !estadosValidos.includes(estado)) {
    throw new Error("Estado inválido");
  }
  return await model.obtenerHistorialCuidadoDueno(dueno_id, estado);
};

module.exports = {
  crearSolicitud,
  obtenerSolicitudesPendientesPaseador,
  responderSolicitud,
  cancelarSolicitud,
  obtenerHistorialDueno,
  obtenerHistorialPaseador,
  completarServicio,
  crearSolicitudCuidado,              
  obtenerSolicitudesPendientesCuidador, 
  obtenerHistorialCuidadoDueno,         
};