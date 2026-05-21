const model = require('../models/notification.model');

const generarDescripcion = (tipo, extra = {}) => {
  const nombre = extra.nombre || "El proveedor";
  switch (tipo) {
    case "nueva_solicitud":
      return `${nombre} ha enviado una nueva solicitud de servicio.`;
    case "solicitud_aceptada":
      return `${nombre} aceptó tu solicitud. ¡Ya está confirmado!`;
    case "solicitud_rechazada":
      return `${nombre} no pudo aceptar tu solicitud en este momento.`;
    case "solicitud_completada":
      return `${nombre} marcó tu servicio como completado. ¡Esperamos que haya sido genial!`;
    case "mensaje_nuevo":
      return `${nombre} te envió un mensaje nuevo.`;
    default:
      return "Tienes una nueva notificación.";
  }
};

const createNotification = async ({ usuario_id, tipo, descripcion, extra = {} }) => {
  const texto = descripcion || generarDescripcion(tipo, extra);
  return await model.createNotification({ usuario_id, tipo, descripcion: texto });
};

const getByUser      = (usuario_id)     => model.getByUser(usuario_id);
const markOneAsRead  = (id, usuario_id) => model.markOneAsRead(id, usuario_id);
const markAllAsRead  = (usuario_id)     => model.markAllAsRead(usuario_id);
const getUnreadCount = (usuario_id)     => model.getUnreadCount(usuario_id);

module.exports = {
  createNotification,
  getByUser,
  markOneAsRead,
  markAllAsRead,
  getUnreadCount,
};