const service = require('../services/notification.service');

// POST /api/notifications  — llamado desde otros servicios (request-service, message-service)
const createNotification = async (req, res) => {
  try {
    const { usuario_id, tipo, descripcion, extra } = req.body;

    if (!usuario_id || !tipo) {
      return res.status(400).json({ message: 'usuario_id y tipo son requeridos' });
    }

    const notif = await service.createNotification({ usuario_id, tipo, descripcion, extra });
    return res.status(201).json({ message: 'Notificación creada', data: notif });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: 'Error al crear la notificación' });
  }
};

// GET /api/notifications — historial completo del usuario (H10.7)
const getNotifications = async (req, res) => {
  try {
    const notifications = await service.getByUser(req.user.id);
    return res.json({ data: notifications });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
};

// GET /api/notifications/unread/count — badge Navbar (H10.5)
const getUnreadCount = async (req, res) => {
  try {
    const total = await service.getUnreadCount(req.user.id);
    return res.json({ data: { total } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener conteo' });
  }
};

// PATCH /api/notifications/:id/read — marcar una como leída
const markOneAsRead = async (req, res) => {
  try {
    const notif = await service.markOneAsRead(parseInt(req.params.id, 10), req.user.id);
    if (!notif) return res.status(404).json({ message: 'Notificación no encontrada' });
    return res.json({ message: 'Notificación marcada como leída', data: notif });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al actualizar la notificación' });
  }
};

// PATCH /api/notifications/read-all — marcar todas como leídas (H10.7)
const markAllAsRead = async (req, res) => {
  try {
    const count = await service.markAllAsRead(req.user.id);
    return res.json({ message: `${count} notificaciones marcadas como leídas` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al actualizar notificaciones' });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markOneAsRead,
  markAllAsRead,
};