const pool = require('../config/db');

/* ── Verificar que la solicitud existe y pertenece al paseador ── */
const verificarSolicitud = async (solicitudId, paseadorUsuarioId) => {
  const { rows } = await pool.query(
    `SELECT s.id, s.estado, s.dueno_id, s.mascota_id
     FROM solicitudes s
     INNER JOIN perfil_paseador pp ON pp.id = s.paseador_id
     WHERE s.id = $1 AND pp.usuario_id = $2`,
    [solicitudId, paseadorUsuarioId]
  );
  return rows[0] || null;
};

/* ── Iniciar paseo: cambiar estado a "en_curso" ── */
const iniciarPaseo = async (solicitudId) => {
  const { rows } = await pool.query(
    `UPDATE solicitudes
     SET estado = 'en_curso', fecha_actualizacion = NOW()
     WHERE id = $1 AND estado = 'aceptada'
     RETURNING *`,
    [solicitudId]
  );
  return rows[0] || null;
};

/* ── Guardar ubicación del paseador ── */
const guardarUbicacion = async (solicitudId, paseadorId, latitud, longitud) => {
  const { rows } = await pool.query(
    `INSERT INTO ubicaciones_paseo (solicitud_id, paseador_id, latitud, longitud, fecha_hora)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING *`,
    [solicitudId, paseadorId, latitud, longitud]
  );
  return rows[0];
};

/* ── Obtener última ubicación del paseador ── */
const obtenerUltimaUbicacion = async (solicitudId) => {
  const { rows } = await pool.query(
    `SELECT u.latitud, u.longitud, u.fecha_hora,
            s.fecha_actualizacion AS inicio_paseo,
            s.estado,
            us.nombre AS paseador_nombre,
            m.nombre  AS mascota_nombre
     FROM ubicaciones_paseo u
     INNER JOIN solicitudes s ON s.id = u.solicitud_id
     INNER JOIN perfil_paseador pp ON pp.id = s.paseador_id
     INNER JOIN usuarios us ON us.id = pp.usuario_id
     INNER JOIN mascotas m ON m.id = s.mascota_id
     WHERE u.solicitud_id = $1
     ORDER BY u.fecha_hora DESC
     LIMIT 1`,
    [solicitudId]
  );
  return rows[0] || null;
};

/* ── Verificar que la solicitud pertenece al dueño ── */
const verificarSolicitudDueno = async (solicitudId, duenoId) => {
  const { rows } = await pool.query(
    `SELECT id, estado FROM solicitudes
     WHERE id = $1 AND dueno_id = $2`,
    [solicitudId, duenoId]
  );
  return rows[0] || null;
};

/* ── Finalizar paseo: cambiar estado a "completada" ── */
const finalizarPaseo = async (solicitudId) => {
  const { rows } = await pool.query(
    `UPDATE solicitudes
     SET estado = 'completada', fecha_actualizacion = NOW()
     WHERE id = $1 AND estado = 'en_curso'
     RETURNING *`,
    [solicitudId]
  );
  return rows[0] || null;
};

module.exports = {
  verificarSolicitud,
  iniciarPaseo,
  guardarUbicacion,
  obtenerUltimaUbicacion,
  verificarSolicitudDueno,
  finalizarPaseo,
};