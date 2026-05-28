const pool = require("../config/db");

/* ── Crear solicitud ── */
const crearSolicitud = async ({
  dueno_id,
  paseador_id,
  mascota_id,
  fecha_servicio,
  hora_servicio,
  duracion_minutos,
  precio_acordado,
  proveedor_usuario_id,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO solicitudes
      (dueno_id, paseador_id, mascota_id, fecha_servicio, hora_servicio,
       duracion_minutos, estado, precio_acordado, proveedor_usuario_id, tipo_proveedor)
     VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', $7, $8, 'paseador')
     RETURNING *`,
    [
      dueno_id,
      paseador_id,
      mascota_id,
      fecha_servicio,
      hora_servicio,
      duracion_minutos,
      precio_acordado,
      proveedor_usuario_id,
    ]
  );

  return rows[0];
};

/* ── Verificar que la mascota pertenece al dueño ── */
const verificarMascota = async (mascota_id, dueno_id) => {
  const { rows } = await pool.query(
    `SELECT id FROM mascotas WHERE id = $1 AND usuario_id = $2`,
    [mascota_id, dueno_id]
  );

  return rows[0] || null;
};

/* ── Verificar que el paseador existe y está aprobado ── */
const verificarPaseador = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT id, usuario_id, tarifa
     FROM perfil_paseador
     WHERE usuario_id = $1 AND aprobado = true`,
    [usuario_id]
  );

  return rows[0] || null;
};

/* ── Obtener solicitudes pendientes del paseador ── */
const obtenerSolicitudesPendientesPaseador = async (
  paseador_usuario_id
) => {
  const { rows } = await pool.query(
    `SELECT
      s.id,
      TO_CHAR(s.fecha_servicio, 'YYYY-MM-DD') AS fecha_servicio,
      s.hora_servicio,
      s.duracion_minutos,
      s.estado,
      s.precio_acordado,
      s.fecha_creacion,
      u.nombre        AS dueno_nombre,
      u.foto_perfil   AS dueno_foto,
      u.telefono      AS dueno_telefono,
      m.nombre        AS mascota_nombre,
      m.raza          AS mascota_raza,
      m.especie       AS mascota_especie,
      m.foto          AS mascota_foto
    FROM solicitudes s
    INNER JOIN perfil_paseador pp ON pp.id = s.paseador_id
    INNER JOIN usuarios u ON u.id = s.dueno_id
    INNER JOIN mascotas m ON m.id = s.mascota_id
    WHERE pp.usuario_id = $1
      AND s.estado = 'pendiente'
    ORDER BY s.fecha_creacion DESC`,
    [paseador_usuario_id]
  );

  return rows;
};

/* ── Responder solicitud ── */
const responderSolicitud = async (
  solicitud_id,
  paseador_usuario_id,
  estado
) => {
  const { rows } = await pool.query(
    `UPDATE solicitudes s
     SET estado = $1, fecha_actualizacion = NOW()
     FROM perfil_paseador pp
     WHERE s.id = $2
       AND pp.id = s.paseador_id
       AND pp.usuario_id = $3
       AND s.estado = 'pendiente'
     RETURNING s.*`,
    [estado, solicitud_id, paseador_usuario_id]
  );

  return rows[0] || null;
};

/* ── Cancelar solicitud ── */
const cancelarSolicitud = async (solicitud_id, dueno_id) => {
  const { rows } = await pool.query(
    `UPDATE solicitudes
     SET estado = 'cancelada', fecha_actualizacion = NOW()
     WHERE id = $1
       AND dueno_id = $2
       AND estado = 'pendiente'
     RETURNING *`,
    [solicitud_id, dueno_id]
  );

  return rows[0] || null;
};

/* ── Historial completo del dueño ── */
const obtenerHistorialDueno = async (dueno_id, estado) => {
  const condicionEstado = estado ? `AND s.estado = '${estado}'` : "";

  const { rows } = await pool.query(
    `SELECT
      s.id,
      s.dueno_id,
      s.tipo_servicio,

      s.paseador_id                           AS perfil_paseador_id,
      pp.usuario_id                           AS paseador_usuario_id,
      up.nombre                               AS paseador_nombre,
      up.foto_perfil                          AS paseador_foto,
      pp.tarifa                               AS paseador_tarifa,

      s.veterinario_id                        AS perfil_vet_id,
      pv.usuario_id                           AS vet_usuario_id,
      uv.nombre                               AS vet_nombre,
      uv.foto_perfil                          AS vet_foto,
      pv.nombre_establecimiento               AS vet_establecimiento,

      TO_CHAR(s.fecha_servicio, 'YYYY-MM-DD') AS fecha_servicio,
      s.hora_servicio,
      s.duracion_minutos,
      s.estado,
      s.precio_acordado,
      s.fecha_creacion,
      s.fecha_actualizacion,

      m.nombre   AS mascota_nombre,
      m.raza     AS mascota_raza,
      m.especie  AS mascota_especie,
      m.foto     AS mascota_foto,
      p.estado   AS pago_estado,
      p.id       AS pago_id
    FROM solicitudes s
    LEFT JOIN perfil_paseador pp    ON pp.id  = s.paseador_id
    LEFT JOIN usuarios up           ON up.id  = pp.usuario_id
    LEFT JOIN perfil_veterinario pv ON pv.id  = s.veterinario_id
    LEFT JOIN usuarios uv           ON uv.id  = pv.usuario_id
    INNER JOIN mascotas m           ON m.id   = s.mascota_id
    LEFT JOIN pagos p ON p.solicitud_id = s.id AND p.estado = 'aprobado'
    WHERE s.dueno_id = $1
    ${condicionEstado}
    ORDER BY s.fecha_creacion DESC`,
    [dueno_id]
  );

  return rows;
};

/* ── Historial completo del paseador ── */
const obtenerHistorialPaseador = async (paseador_usuario_id, estado) => {
  const condicionEstado = estado ? `AND s.estado = '${estado}'` : "";

  const { rows } = await pool.query(
    `SELECT
      s.id,
      TO_CHAR(s.fecha_servicio, 'YYYY-MM-DD') AS fecha_servicio,
      s.hora_servicio,
      s.duracion_minutos,
      s.estado,
      s.precio_acordado,
      s.fecha_creacion,
      s.fecha_actualizacion,
      u.nombre        AS dueno_nombre,
      u.foto_perfil   AS dueno_foto,
      u.telefono      AS dueno_telefono,
      m.nombre        AS mascota_nombre,
      m.raza          AS mascota_raza,
      m.especie       AS mascota_especie,
      m.foto          AS mascota_foto
    FROM solicitudes s
    INNER JOIN perfil_paseador pp ON pp.id = s.paseador_id
    INNER JOIN usuarios u ON u.id = s.dueno_id
    INNER JOIN mascotas m ON m.id = s.mascota_id
    WHERE pp.usuario_id = $1
    ${condicionEstado}
    ORDER BY s.fecha_creacion DESC`,
    [paseador_usuario_id]
  );

  return rows;
};

/* ── Completar servicio ── */
const completarServicio = async (
  solicitud_id,
  paseador_usuario_id
) => {
  const hoy = new Date().toISOString().split("T")[0];

  const { rows } = await pool.query(
    `UPDATE solicitudes s
     SET estado = 'completada', fecha_actualizacion = NOW()
     FROM perfil_paseador pp
     WHERE s.id = $1
       AND pp.id = s.paseador_id
       AND pp.usuario_id = $2
       AND s.estado = 'aceptada'
       AND s.fecha_servicio <= $3
     RETURNING s.*`,
    [solicitud_id, paseador_usuario_id, hoy]
  );

  return rows[0] || null;
};

/* ── Dashboard paseador: solicitudes activas ── */
const obtenerSolicitudesActivasPaseador = async (paseador_usuario_id) => {
  const { rows } = await pool.query(
    `SELECT
      s.id,
      TO_CHAR(s.fecha_servicio, 'YYYY-MM-DD') AS fecha_servicio,
      s.hora_servicio,
      s.duracion_minutos,
      s.estado,
      s.precio_acordado,
      s.fecha_creacion,
      u.nombre        AS dueno_nombre,
      u.foto_perfil   AS dueno_foto,
      u.telefono      AS dueno_telefono,
      m.nombre        AS mascota_nombre,
      m.raza          AS mascota_raza,
      m.especie       AS mascota_especie,
      m.foto          AS mascota_foto
    FROM solicitudes s
    INNER JOIN perfil_paseador pp ON pp.id = s.paseador_id
    INNER JOIN usuarios u ON u.id = s.dueno_id
    INNER JOIN mascotas m ON m.id = s.mascota_id
    WHERE pp.usuario_id = $1
      AND s.estado IN ('pendiente', 'aceptada')
    ORDER BY s.fecha_servicio ASC, s.hora_servicio ASC`,
    [paseador_usuario_id]
  );

  return rows;
};

/* ── Dashboard paseador: completadas ── */
const obtenerCompletadasPaseador = async (paseador_usuario_id) => {
  const { rows } = await pool.query(
    `SELECT
      s.id,
      TO_CHAR(s.fecha_servicio, 'YYYY-MM-DD') AS fecha_servicio,
      s.hora_servicio,
      s.duracion_minutos,
      s.estado,
      s.fecha_actualizacion,
      COALESCE(
        s.precio_acordado,
        ROUND((pp.tarifa / 60.0) * s.duracion_minutos, 0)
      ) AS precio_total,
      u.nombre        AS dueno_nombre,
      u.foto_perfil   AS dueno_foto,
      m.nombre        AS mascota_nombre,
      m.raza          AS mascota_raza,
      m.especie       AS mascota_especie,
      m.foto          AS mascota_foto
    FROM solicitudes s
    INNER JOIN perfil_paseador pp ON pp.id = s.paseador_id
    INNER JOIN usuarios u ON u.id = s.dueno_id
    INNER JOIN mascotas m ON m.id = s.mascota_id
    WHERE pp.usuario_id = $1
      AND s.estado = 'completada'
    ORDER BY s.fecha_actualizacion DESC`,
    [paseador_usuario_id]
  );

  return rows;
};

/* ── Obtener nombre del dueño ── */
const obtenerNombreDueno = async (dueno_id) => {
  const { rows } = await pool.query(
    `SELECT nombre FROM usuarios WHERE id = $1`,
    [dueno_id]
  );

  return rows[0]?.nombre || "Un dueño";
};

/* ── Verificar que el veterinario existe y está aprobado ── */
const verificarVeterinario = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT id FROM perfil_veterinario WHERE usuario_id = $1 AND aprobado = true`,
    [usuario_id]
  );
  return rows[0] || null;
};

/* ── Crear solicitud de consulta veterinaria ── */
const crearSolicitudVet = async ({ dueno_id, veterinario_id, mascota_id, fecha_servicio, hora_servicio }) => {
  const { rows } = await pool.query(
    `INSERT INTO solicitudes 
      (dueno_id, veterinario_id, mascota_id, fecha_servicio, hora_servicio, estado, tipo_servicio)
     VALUES ($1, $2, $3, $4, $5, 'pendiente', 'consulta_vet')
     RETURNING *`,
    [dueno_id, veterinario_id, mascota_id, fecha_servicio, hora_servicio]
  );
  return rows[0];
};

/* ── Solicitudes pendientes del veterinario ── */
const obtenerSolicitudesPendientesVet = async (vet_usuario_id) => {
  const { rows } = await pool.query(
    `SELECT 
      s.id,
      TO_CHAR(s.fecha_servicio, 'YYYY-MM-DD') AS fecha_servicio,
      s.hora_servicio,
      s.estado,
      s.fecha_creacion,
      u.nombre        AS dueno_nombre,
      u.foto_perfil   AS dueno_foto,
      u.telefono      AS dueno_telefono,
      m.nombre        AS mascota_nombre,
      m.raza          AS mascota_raza,
      m.especie       AS mascota_especie,
      m.foto          AS mascota_foto
    FROM solicitudes s
    INNER JOIN perfil_veterinario pv ON pv.id = s.veterinario_id
    INNER JOIN usuarios u ON u.id = s.dueno_id
    INNER JOIN mascotas m ON m.id = s.mascota_id
    WHERE pv.usuario_id = $1
      AND s.estado = 'pendiente'
    ORDER BY s.fecha_creacion DESC`,
    [vet_usuario_id]
  );
  return rows;
};

/* ── Responder solicitud vet (aceptar o rechazar) ── */
const responderSolicitudVet = async (solicitud_id, vet_usuario_id, estado) => {
  const { rows } = await pool.query(
    `UPDATE solicitudes s
     SET estado = $1, fecha_actualizacion = NOW()
     FROM perfil_veterinario pv
     WHERE s.id = $2
       AND pv.id = s.veterinario_id
       AND pv.usuario_id = $3
       AND s.estado = 'pendiente'
     RETURNING s.*`,
    [estado, solicitud_id, vet_usuario_id]
  );
  return rows[0] || null;
};

/* ── Historial de consultas del dueño ── */
const obtenerHistorialVetDueno = async (dueno_id, estado) => {
  const condicionEstado = estado ? `AND s.estado = '${estado}'` : "";
  const { rows } = await pool.query(
    `SELECT
      s.id,
      s.dueno_id,
      s.veterinario_id              AS perfil_vet_id,
      pv.usuario_id                 AS vet_usuario_id,
      TO_CHAR(s.fecha_servicio, 'YYYY-MM-DD') AS fecha_servicio,
      s.hora_servicio,
      s.estado,
      s.fecha_creacion,
      s.fecha_actualizacion,
      u.nombre      AS vet_nombre,
      u.foto_perfil AS vet_foto,
      pv.nombre_establecimiento,
      m.nombre      AS mascota_nombre,
      m.raza        AS mascota_raza,
      m.especie     AS mascota_especie,
      m.foto        AS mascota_foto
    FROM solicitudes s
    INNER JOIN perfil_veterinario pv ON pv.id = s.veterinario_id
    INNER JOIN usuarios u ON u.id = pv.usuario_id
    INNER JOIN mascotas m ON m.id = s.mascota_id
    WHERE s.dueno_id = $1
      AND s.tipo_servicio = 'consulta_vet'
    ${condicionEstado}
    ORDER BY s.fecha_creacion DESC`,
    [dueno_id]
  );
  return rows;
};

module.exports = {
  crearSolicitud,
  verificarMascota,
  verificarPaseador,
  obtenerSolicitudesPendientesPaseador,
  responderSolicitud,
  cancelarSolicitud,
  obtenerHistorialDueno,
  obtenerHistorialPaseador,
  completarServicio,
  obtenerSolicitudesActivasPaseador,
  obtenerCompletadasPaseador,
  obtenerNombreDueno,
  verificarVeterinario,
  crearSolicitudVet,
  obtenerSolicitudesPendientesVet,
  responderSolicitudVet,
  obtenerHistorialVetDueno,
};