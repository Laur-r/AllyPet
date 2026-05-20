const model = require("../models/solicitud.model");

const COMISION_PLATAFORMA = 0.12; // 12% Allypet

/* ── Crear solicitud con precio acordado ── */
const crearSolicitud = async ({
  dueno_id, paseador_id, mascota_id,
  fecha_servicio, hora_servicio, duracion_minutos,
}) => {
  if (!paseador_id || !mascota_id || !fecha_servicio || !hora_servicio || !duracion_minutos) {
    throw new Error("Todos los campos son requeridos");
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSolicitud = new Date(fecha_servicio + "T00:00:00");
  if (fechaSolicitud < hoy) {
    throw new Error("La fecha del servicio no puede ser en el pasado");
  }

  const mascota = await model.verificarMascota(mascota_id, dueno_id);
  if (!mascota) throw new Error("La mascota no existe o no te pertenece");

  // ✅ verificarPaseador ahora recibe usuario_id y devuelve { id, usuario_id, tarifa }
  const paseador = await model.verificarPaseador(paseador_id);
  if (!paseador) throw new Error("El paseador no existe o no está disponible");

  // ✅ Calcular precio y guardarlo en la solicitud
  const precio_acordado = paseador.tarifa
    ? Math.round((paseador.tarifa / 60) * duracion_minutos)
    : null;

  const solicitud = await model.crearSolicitud({
    dueno_id,
    paseador_id:          paseador.id,          // perfil_paseador.id
    proveedor_usuario_id: paseador.usuario_id,   // usuarios.id del paseador
    mascota_id,
    fecha_servicio,
    hora_servicio,
    duracion_minutos,
    precio_acordado,
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
  if (!solicitud) throw new Error("Solicitud no encontrada o no puedes modificarla");
  return solicitud;
};

const cancelarSolicitud = async (solicitud_id, dueno_id) => {
  const solicitud = await model.cancelarSolicitud(solicitud_id, dueno_id);
  if (!solicitud) throw new Error("Solicitud no encontrada o no puedes cancelarla");
  return solicitud;
};

const obtenerHistorialDueno = async (dueno_id, estado) => {
  const estadosValidos = ["pendiente", "aceptada", "rechazada", "cancelada", "completada"];
  if (estado && !estadosValidos.includes(estado)) throw new Error("Estado inválido");
  return await model.obtenerHistorialDueno(dueno_id, estado);
};

const obtenerHistorialPaseador = async (paseador_usuario_id, estado) => {
  const estadosValidos = ["pendiente", "aceptada", "rechazada", "cancelada", "completada"];
  if (estado && !estadosValidos.includes(estado)) throw new Error("Estado inválido");
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

const obtenerDashboardPaseador = async (paseador_usuario_id) => {
  const [activas, completadas] = await Promise.all([
    model.obtenerSolicitudesActivasPaseador(paseador_usuario_id),
    model.obtenerCompletadasPaseador(paseador_usuario_id),
  ]);
  return { activas, completadas };
};

module.exports = {
  crearSolicitud,
  obtenerSolicitudesPendientesPaseador,
  responderSolicitud,
  cancelarSolicitud,
  obtenerHistorialDueno,
  obtenerHistorialPaseador,
  completarServicio,
  obtenerDashboardPaseador,
  COMISION_PLATAFORMA,
};