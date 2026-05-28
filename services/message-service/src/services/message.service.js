const model = require('../models/message.model');
const pool  = require('../config/db');

// Valida que exista alguna relación activa entre los dos usuarios
// Cubre: dueño ↔ paseador (tabla solicitudes) y dueño ↔ veterinario (tabla servicios)
const hasSolicitudActiva = async (remitente_id, destinatario_id) => {
  // Caso 1: dueño ↔ paseador — busca en solicitudes
  const solicitud = await pool.query(
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
  if (solicitud.rowCount > 0) return true;

  // Caso 2: dueño ↔ veterinario — busca en servicios
  const servicio = await pool.query(
    `SELECT id
     FROM servicios
     WHERE estado NOT IN ('cancelado')
       AND (
         (id_dueno = $1 AND id_proveedor = $2) OR
         (id_dueno = $2 AND id_proveedor = $1)
       )
     LIMIT 1`,
    [remitente_id, destinatario_id]
  );
  if (servicio.rowCount > 0) return true;

  // Caso 3: cualquier usuario con perfil veterinario puede recibir mensajes
  // (para que el dueño pueda contactar al vet aunque no tenga servicio previo)
  const esVet = await pool.query(
    `SELECT id FROM perfil_veterinario
     WHERE usuario_id = $1 OR usuario_id = $2
     LIMIT 1`,
    [remitente_id, destinatario_id]
  );
  if (esVet.rowCount > 0) return true;

  return false;
};

const sendMessage = async ({ solicitud_id, remitente_id, destinatario_id, contenido }) => {
  const allowed = await hasSolicitudActiva(remitente_id, destinatario_id);
  if (!allowed) {
    throw { status: 403, message: 'No hay una relación activa entre estos usuarios' };
  }
  return model.createMessage({ solicitud_id, remitente_id, destinatario_id, contenido });
};

const getConversations = (usuario_id) => model.getConversations(usuario_id);

const getMessages = async (usuario_id, interlocutor_id) => {
  const messages = await model.getMessages(usuario_id, interlocutor_id);
  await model.markAsRead(usuario_id, interlocutor_id);
  return messages;
};

const getUnreadCount = (usuario_id) => model.getUnreadCount(usuario_id);

module.exports = { sendMessage, getConversations, getMessages, getUnreadCount };