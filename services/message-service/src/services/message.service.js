const model = require('../models/message.model');
const pool  = require('../config/db');

// Valida que exista una solicitud activa entre remitente y destinatario
const hasSolicitudActiva = async (remitente_id, destinatario_id) => {
  const result = await pool.query(
    `SELECT s.id 
     FROM solicitudes s
     INNER JOIN perfil_paseador pp ON pp.id = s.paseador_id
     WHERE s.estado NOT IN ('rechazada', 'cancelada')
       AND (
         (s.dueno_id = $1 AND pp.usuario_id = $2) OR
         (s.dueno_id = $2 AND pp.usuario_id = $1)
       )
     LIMIT 1`,
    [remitente_id, destinatario_id]
  );
  return result.rowCount > 0;
};

const sendMessage = async ({ solicitud_id, remitente_id, destinatario_id, contenido }) => {
  // Dueño → proveedor requiere solicitud activa
  const allowed = await hasSolicitudActiva(remitente_id, destinatario_id);
  if (!allowed) {
    throw { status: 403, message: 'No hay una solicitud activa entre estos usuarios' };
  }
  return model.createMessage({ solicitud_id, remitente_id, destinatario_id, contenido });
};

const getConversations = (usuario_id) => model.getConversations(usuario_id);

const getMessages = async (usuario_id, interlocutor_id) => {
  const messages = await model.getMessages(usuario_id, interlocutor_id);
  // Marca como leídos al abrir la conversación (criterio H10.2)
  await model.markAsRead(usuario_id, interlocutor_id);
  return messages;
};

const getUnreadCount = (usuario_id) => model.getUnreadCount(usuario_id);

module.exports = { sendMessage, getConversations, getMessages, getUnreadCount };