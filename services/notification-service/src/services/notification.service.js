const model = require('../models/notification.model');

// Tipos válidos de notificación
const TIPOS_VALIDOS = [
  'nueva_solicitud',
  'mensaje_nuevo',
  'solicitud_aceptada',
  'solicitud_rechazada',
  'solicitud_completada',
];

// Descripción automática según el tipo (H10.4)
const buildDescription = (tipo, extra = {}) => {
  switch (tipo) {
    case 'solicitud_aceptada':
      return `Tu solicitud de servicio fue aceptada${extra.nombre ? ` por ${extra.nombre}` : ''}.`;
    case 'solicitud_rechazada':
      return `Tu solicitud de servicio fue rechazada${extra.nombre ? ` por ${extra.nombre}` : ''}.`;
    case 'solicitud_completada':
      return `Tu servicio ha sido marcado como completado${extra.nombre ? ` por ${extra.nombre}` : ''}.`;
    case 'mensaje_nuevo':
      return `Tienes un mensaje nuevo${extra.nombre ? ` de ${extra.nombre}` : ''}.`;
    default:
      return extra.descripcion || 'Tienes una notificación nueva.';
  }
};

const createNotification = async ({ usuario_id, tipo, descripcion, extra }) => {
  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw { status: 400, message: `Tipo de notificación inválido: ${tipo}` };
  }
  const desc = descripcion || buildDescription(tipo, extra);
  return model.createNotification({ usuario_id, tipo, descripcion: desc });
};

const getByUser       = (usuario_id) => model.getByUser(usuario_id);
const markOneAsRead   = (id, usuario_id) => model.markOneAsRead(id, usuario_id);
const markAllAsRead   = (usuario_id) => model.markAllAsRead(usuario_id);
const getUnreadCount  = (usuario_id) => model.getUnreadCount(usuario_id);

module.exports = {
  createNotification,
  getByUser,
  markOneAsRead,
  markAllAsRead,
  getUnreadCount,
};