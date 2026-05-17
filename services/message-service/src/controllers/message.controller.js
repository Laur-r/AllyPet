const service = require('../services/message.service');

// POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { solicitud_id, destinatario_id, contenido } = req.body;
    const remitente_id = req.user.id;

    if (!destinatario_id || !contenido?.trim()) {
      return res.status(400).json({ message: 'destinatario_id y contenido son requeridos' });
    }

    const mensaje = await service.sendMessage({
      solicitud_id,
      remitente_id,
      destinatario_id,
      contenido: contenido.trim(),
    });

    return res.status(201).json({ message: 'Mensaje enviado', data: mensaje });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: 'Error al enviar el mensaje' });
  }
};

// GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const conversations = await service.getConversations(req.user.id);
    return res.json({ data: conversations });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener conversaciones' });
  }
};

// GET /api/messages/:interlocutor_id
const getMessages = async (req, res) => {
  try {
    const { interlocutor_id } = req.params;
    const messages = await service.getMessages(req.user.id, parseInt(interlocutor_id, 10));
    return res.json({ data: messages });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener mensajes' });
  }
};

// GET /api/messages/unread/count
const getUnreadCount = async (req, res) => {
  try {
    const total = await service.getUnreadCount(req.user.id);
    return res.json({ data: { total } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener conteo' });
  }
};

module.exports = { sendMessage, getConversations, getMessages, getUnreadCount };