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

    // Enviar notificación al proveedor
    try {
      const nombreDueno = await service.obtenerNombreDueno(dueno_id);
      const descripcion = `Tienes una nueva solicitud de servicio de ${nombreDueno} para el día ${fecha_servicio}.`;
      
      const NOTIFICATION_URL = process.env.NOTIFICATION_URL || 'http://localhost:3010/api/notifications';
      fetch(NOTIFICATION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: paseador_id,
          tipo: 'nueva_solicitud',
          descripcion: descripcion
        })
      }).catch(err => console.error("Error enviando notificacion:", err.message));
    } catch (e) {
      console.error("Error al obtener nombre del dueño para notificacion:", e.message);
    }

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

    // Enviar notificación al dueño
    try {
      // Necesitamos obtener el usuario_id del paseador/veterinario para poner su nombre
      const { rows } = await require("../config/db").query(`SELECT nombre FROM usuarios WHERE id = $1`, [paseador_usuario_id]);
      const nombrePaseador = rows[0]?.nombre || 'El proveedor';
      
      const tipoNotif = estado === "aceptada" ? "solicitud_aceptada" : "solicitud_rechazada";
      const descripcion = estado === "aceptada" 
        ? `Tu solicitud de servicio ha sido aceptada por ${nombrePaseador}.`
        : `Tu solicitud de servicio ha sido rechazada por ${nombrePaseador}.`;

      const NOTIFICATION_URL = process.env.NOTIFICATION_URL || 'http://localhost:3010/api/notifications';
      fetch(NOTIFICATION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: solicitud.dueno_id,
          tipo: tipoNotif,
          descripcion: descripcion
        })
      }).catch(err => console.error("Error enviando notificacion de respuesta:", err.message));
    } catch (e) {
      console.error("Error al notificar respuesta al dueño:", e.message);
    }

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