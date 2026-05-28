const model = require("../models/solicitud.model");
const pool  = require("../config/db");

const COMISION_PLATAFORMA = 0.12;

const NOTIFICATION_SERVICE = "http://localhost:3010/api/notifications";

const crearNotificacion = async ({ usuario_id, tipo, extra }) => {
  try {
    const response = await fetch(NOTIFICATION_SERVICE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario_id, tipo, extra }),
    });
    if (!response.ok) {
      console.error("notification-service respondió:", response.status);
    }
  } catch (err) {
    console.error("notification-service error:", err.message);
  }
};

const crearSolicitud = async ({ dueno_id, paseador_id, mascota_id, fecha_servicio, hora_servicio, duracion_minutos }) => {
  if (!paseador_id || !mascota_id || !fecha_servicio || !hora_servicio || !duracion_minutos) {
    throw new Error("Todos los campos son requeridos");
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSolicitud = new Date(fecha_servicio + "T00:00:00");
  if (fechaSolicitud < hoy) throw new Error("La fecha del servicio no puede ser en el pasado");

  const mascota = await model.verificarMascota(mascota_id, dueno_id);
  if (!mascota) throw new Error("La mascota no existe o no te pertenece");

  const paseador = await model.verificarPaseador(paseador_id);
  if (!paseador) throw new Error("El paseador no existe o no está disponible");

  const precio_acordado = paseador.tarifa
    ? Math.round((paseador.tarifa / 60) * duracion_minutos)
    : null;

  return await model.crearSolicitud({
    dueno_id,
    paseador_id:          paseador.id,
    proveedor_usuario_id: paseador.usuario_id,
    mascota_id,
    fecha_servicio,
    hora_servicio,
    duracion_minutos,
    precio_acordado,
  });
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

  const tipo = estado === "aceptada" ? "solicitud_aceptada" : "solicitud_rechazada";
  const { rows } = await pool.query(
    `SELECT u.nombre FROM usuarios u
     INNER JOIN perfil_paseador pp ON pp.usuario_id = u.id
     WHERE pp.usuario_id = $1`,
    [paseador_usuario_id]
  );
  const nombrePaseador = rows[0]?.nombre || "El paseador";

  await crearNotificacion({ usuario_id: solicitud.dueno_id, tipo, extra: { nombre: nombrePaseador } });

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
    throw new Error("No se puede completar esta solicitud. Verifica que esté aceptada y que la fecha del servicio ya haya llegado.");
  }

  const { rows } = await pool.query(
    `SELECT u.nombre FROM usuarios u
     INNER JOIN perfil_paseador pp ON pp.usuario_id = u.id
     WHERE pp.usuario_id = $1`,
    [paseador_usuario_id]
  );
  const nombrePaseador = rows[0]?.nombre || "El paseador";

  await crearNotificacion({ usuario_id: solicitud.dueno_id, tipo: "solicitud_completada", extra: { nombre: nombrePaseador } });

  return solicitud;
};

const obtenerDashboardPaseador = async (paseador_usuario_id) => {
  const [activas, completadas] = await Promise.all([
    model.obtenerSolicitudesActivasPaseador(paseador_usuario_id),
    model.obtenerCompletadasPaseador(paseador_usuario_id),
  ]);
  return { activas, completadas };
};

const obtenerNombreDueno = async (dueno_id) => {
  return await model.obtenerNombreDueno(dueno_id);
};

const crearSolicitudVet = async ({ dueno_id, veterinario_id, mascota_id, fecha_servicio, hora_servicio }) => {
  if (!veterinario_id || !mascota_id || !fecha_servicio || !hora_servicio) {
    throw new Error("Todos los campos son requeridos");
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSolicitud = new Date(fecha_servicio + "T00:00:00");
  if (fechaSolicitud < hoy) throw new Error("La fecha del servicio no puede ser en el pasado");

  const mascota = await model.verificarMascota(mascota_id, dueno_id);
  if (!mascota) throw new Error("La mascota no existe o no te pertenece");

  const vet = await model.verificarVeterinario(veterinario_id);
  if (!vet) throw new Error("El veterinario no existe o no está disponible");

  return await model.crearSolicitudVet({
    dueno_id,
    veterinario_id: vet.id,
    mascota_id,
    fecha_servicio,
    hora_servicio,
  });
};

const obtenerSolicitudesPendientesVet = async (vet_usuario_id) => {
  return await model.obtenerSolicitudesPendientesVet(vet_usuario_id);
};

const responderSolicitudVet = async (solicitud_id, vet_usuario_id, estado) => {
  if (!["aceptada", "rechazada"].includes(estado)) {
    throw new Error("Estado inválido. Debe ser 'aceptada' o 'rechazada'");
  }

  const solicitud = await model.responderSolicitudVet(solicitud_id, vet_usuario_id, estado);
  if (!solicitud) throw new Error("Solicitud no encontrada o no puedes modificarla");

  const tipo = estado === "aceptada" ? "solicitud_aceptada" : "solicitud_rechazada";
  const { rows } = await pool.query(
    `SELECT u.nombre FROM usuarios u
     INNER JOIN perfil_veterinario pv ON pv.usuario_id = u.id
     WHERE pv.usuario_id = $1`,
    [vet_usuario_id]
  );
  const nombreVet = rows[0]?.nombre || "El veterinario";

  await crearNotificacion({ usuario_id: solicitud.dueno_id, tipo, extra: { nombre: nombreVet } });

  return solicitud;
};

const obtenerHistorialVetDueno = async (dueno_id, estado) => {
  const estadosValidos = ["pendiente", "aceptada", "rechazada", "cancelada", "completada"];
  if (estado && !estadosValidos.includes(estado)) throw new Error("Estado inválido");
  return await model.obtenerHistorialVetDueno(dueno_id, estado);
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
  obtenerNombreDueno,
  COMISION_PLATAFORMA,
  crearSolicitudVet,
  obtenerSolicitudesPendientesVet,
  responderSolicitudVet,
  obtenerHistorialVetDueno,
};