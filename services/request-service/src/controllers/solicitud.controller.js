const service = require("../services/solicitud.service");

/* ─────────────────────────────────────────
   POST /api/solicitudes
   Body: { paseador_id, mascota_id, fecha_servicio, hora_servicio, duracion_minutos }
   El dueno_id sale del token JWT
───────────────────────────────────────── */
const crearSolicitud = async (req, res) => {
  try {
    const dueno_id = req.usuario.id;
    const { paseador_id, mascota_id, fecha_servicio, hora_servicio, duracion_minutos } = req.body;

    const solicitud = await service.crearSolicitud({
      dueno_id,
      paseador_id,
      mascota_id,
      fecha_servicio,
      hora_servicio,
      duracion_minutos,
    });

    return res.status(201).json({
      message: "Solicitud enviada correctamente",
      data: solicitud,
    });
  } catch (err) {
    console.error("crearSolicitud:", err.message);
    const status = err.message.includes("no existe") || err.message.includes("no te pertenece") ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   GET /api/solicitudes/paseador/pendientes
   El paseador_usuario_id sale del token JWT
───────────────────────────────────────── */
const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    const paseador_usuario_id = req.usuario.id;
    const solicitudes = await service.obtenerSolicitudesPendientesPaseador(paseador_usuario_id);
    return res.status(200).json({
      message: "Solicitudes pendientes obtenidas",
      data: solicitudes,
    });
  } catch (err) {
    console.error("obtenerSolicitudesPendientes:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   PUT /api/solicitudes/:id/responder
   Body: { estado: "aceptada" | "rechazada" }
───────────────────────────────────────── */
const responderSolicitud = async (req, res) => {
  try {
    const paseador_usuario_id = req.usuario.id;
    const solicitud_id = Number(req.params.id);
    const { estado } = req.body;

    const solicitud = await service.responderSolicitud(solicitud_id, paseador_usuario_id, estado);
    return res.status(200).json({
      message: `Solicitud ${estado} correctamente`,
      data: solicitud,
    });
  } catch (err) {
    console.error("responderSolicitud:", err.message);
    const status = err.message.includes("no encontrada") || err.message.includes("inválido") ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   PUT /api/solicitudes/:id/cancelar
   Solo el dueño puede cancelar solicitudes pendientes
───────────────────────────────────────── */
const cancelarSolicitud = async (req, res) => {
  try {
    const dueno_id     = req.usuario.id;
    const solicitud_id = Number(req.params.id);
    const solicitud    = await service.cancelarSolicitud(solicitud_id, dueno_id);
    return res.status(200).json({
      message: "Solicitud cancelada correctamente",
      data: solicitud,
    });
  } catch (err) {
    console.error("cancelarSolicitud:", err.message);
    const status = err.message.includes("no encontrada") ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   GET /api/solicitudes/dueno/historial
   Query param opcional: ?estado=pendiente|aceptada|rechazada|cancelada|completada
───────────────────────────────────────── */
const obtenerHistorialDueno = async (req, res) => {
  try {
    const dueno_id = req.usuario.id;
    const { estado } = req.query;
    const solicitudes = await service.obtenerHistorialDueno(dueno_id, estado);
    return res.status(200).json({
      message: "Historial obtenido",
      data: solicitudes,
    });
  } catch (err) {
    console.error("obtenerHistorialDueno:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   GET /api/solicitudes/paseador/historial
   Query param opcional: ?estado=pendiente|aceptada|rechazada|cancelada|completada
───────────────────────────────────────── */
const obtenerHistorialPaseador = async (req, res) => {
  try {
    const paseador_usuario_id = req.usuario.id;
    const { estado } = req.query;
    const solicitudes = await service.obtenerHistorialPaseador(paseador_usuario_id, estado);
    return res.status(200).json({
      message: "Historial obtenido",
      data: solicitudes,
    });
  } catch (err) {
    console.error("obtenerHistorialPaseador:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   PUT /api/solicitudes/:id/completar
   Solo el paseador, solo aceptadas, solo si la fecha ya pasó o es hoy
───────────────────────────────────────── */
const completarServicio = async (req, res) => {
  try {
    const paseador_usuario_id = req.usuario.id;
    const solicitud_id        = Number(req.params.id);

    const solicitud = await service.completarServicio(solicitud_id, paseador_usuario_id);
    return res.status(200).json({
      message: "Servicio marcado como completado",
      data: solicitud,
    });
  } catch (err) {
    console.error("completarServicio:", err.message);
    const status = err.message.includes("No se puede") ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
};

/* ─────────────────────────────────────────
   GET /api/solicitudes/paseador/dashboard
   Devuelve activas (pendiente + aceptada) y completadas en una sola llamada
   El paseador_usuario_id sale del token JWT
───────────────────────────────────────── */
const obtenerDashboardPaseador = async (req, res) => {
  try {
    const paseador_usuario_id = req.usuario.id;
    const datos = await service.obtenerDashboardPaseador(paseador_usuario_id);
    return res.status(200).json({
      message: "Dashboard obtenido",
      data: datos,
    });
  } catch (err) {
    console.error("obtenerDashboardPaseador:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  crearSolicitud,
  obtenerSolicitudesPendientes,
  responderSolicitud,
  cancelarSolicitud,
  obtenerHistorialDueno,
  obtenerHistorialPaseador,
  completarServicio,
  obtenerDashboardPaseador,
};