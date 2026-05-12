const pool = require('../config/db');

// Guarda un mensaje nuevo
const createMessage = async ({ solicitud_id, remitente_id, destinatario_id, contenido }) => {
  const result = await pool.query(
    `INSERT INTO mensajes (solicitud_id, remitente_id, destinatario_id, contenido)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [solicitud_id || null, remitente_id, destinatario_id, contenido]
  );
  return result.rows[0];
};

// Lista de conversaciones activas para un usuario
// Estrategia: obtener el último mensaje de cada par (usuario, interlocutor)
const getConversations = async (usuario_id) => {
  const result = await pool.query(
    `SELECT
       interlocutor_id,
       u.nombre        AS interlocutor_nombre,
       u.foto_perfil   AS interlocutor_foto,
       ultimo_mensaje,
       fecha_envio,
       remitente_id,
       no_leidos
     FROM (
       -- Por cada conversación, trae el mensaje más reciente
       SELECT DISTINCT ON (interlocutor_id)
         CASE
           WHEN m.remitente_id = $1 THEN m.destinatario_id
           ELSE m.remitente_id
         END                  AS interlocutor_id,
         m.contenido          AS ultimo_mensaje,
         m.fecha_envio,
         m.remitente_id
       FROM mensajes m
       WHERE m.remitente_id = $1 OR m.destinatario_id = $1
       ORDER BY interlocutor_id, m.fecha_envio DESC
     ) AS convs
     -- Datos del interlocutor
     JOIN usuarios u ON u.id = convs.interlocutor_id
     -- Conteo de no leídos (mensajes que me enviaron y no he leído)
     LEFT JOIN LATERAL (
       SELECT COUNT(*) AS no_leidos
       FROM mensajes m2
       WHERE m2.remitente_id    = convs.interlocutor_id
         AND m2.destinatario_id = $1
         AND m2.leido           = FALSE
     ) AS unread ON TRUE
     ORDER BY convs.fecha_envio DESC`,
    [usuario_id]
  );
  return result.rows;
};

// Mensajes de una conversación entre dos usuarios (orden cronológico)
const getMessages = async (usuario_id, interlocutor_id) => {
  const result = await pool.query(
    `SELECT m.*, u.nombre AS remitente_nombre, u.foto_perfil AS remitente_foto
     FROM mensajes m
     JOIN usuarios u ON u.id = m.remitente_id
     WHERE
       (m.remitente_id = $1 AND m.destinatario_id = $2) OR
       (m.remitente_id = $2 AND m.destinatario_id = $1)
     ORDER BY m.fecha_envio ASC`,
    [usuario_id, interlocutor_id]
  );
  return result.rows;
};

// Marca como leídos todos los mensajes del interlocutor hacia el usuario
const markAsRead = async (usuario_id, interlocutor_id) => {
  const result = await pool.query(
    `UPDATE mensajes
     SET leido = TRUE
     WHERE destinatario_id = $1 AND remitente_id = $2 AND leido = FALSE
     RETURNING id`,
    [usuario_id, interlocutor_id]
  );
  return result.rowCount;
};

// Total de mensajes no leídos del usuario (para el badge del Navbar)
const getUnreadCount = async (usuario_id) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS total
     FROM mensajes
     WHERE destinatario_id = $1 AND leido = FALSE`,
    [usuario_id]
  );
  return parseInt(result.rows[0].total, 10);
};

module.exports = { createMessage, getConversations, getMessages, markAsRead, getUnreadCount };