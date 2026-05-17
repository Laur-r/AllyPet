const pool = require('../config/db');

// Crea una notificación (llamado internamente desde otros servicios o este mismo)
const createNotification = async ({ usuario_id, tipo, descripcion }) => {
  const result = await pool.query(
    `INSERT INTO notificaciones (usuario_id, tipo, descripcion)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [usuario_id, tipo, descripcion]
  );
  return result.rows[0];
};

// Lista todas las notificaciones del usuario, más recientes primero
const getByUser = async (usuario_id) => {
  const result = await pool.query(
    `SELECT * FROM notificaciones
     WHERE usuario_id = $1
     ORDER BY fecha DESC`,
    [usuario_id]
  );
  return result.rows;
};

// Marca una notificación específica como leída
const markOneAsRead = async (notificacion_id, usuario_id) => {
  const result = await pool.query(
    `UPDATE notificaciones
     SET leido = TRUE
     WHERE id = $1 AND usuario_id = $2
     RETURNING *`,
    [notificacion_id, usuario_id]
  );
  return result.rows[0] || null;
};

// Marca TODAS las notificaciones del usuario como leídas (H10.7)
const markAllAsRead = async (usuario_id) => {
  const result = await pool.query(
    `UPDATE notificaciones
     SET leido = TRUE
     WHERE usuario_id = $1 AND leido = FALSE
     RETURNING id`,
    [usuario_id]
  );
  return result.rowCount;
};

// Total de notificaciones no leídas (para badge del Navbar)
const getUnreadCount = async (usuario_id) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS total
     FROM notificaciones
     WHERE usuario_id = $1 AND leido = FALSE`,
    [usuario_id]
  );
  return parseInt(result.rows[0].total, 10);
};

module.exports = {
  createNotification,
  getByUser,
  markOneAsRead,
  markAllAsRead,
  getUnreadCount,
};