const router     = require('express').Router();
const controller = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// POST interno — otros servicios crean notificaciones (sin verifyToken para uso interno)
// En producción se protegería con un API key o red interna
router.post('/', controller.createNotification);

// Todos los demás requieren token del usuario
router.use(verifyToken);

// H10.5 — Badge conteo de no leídas
router.get('/unread/count', controller.getUnreadCount);

// H10.7 — Marcar todas como leídas
router.patch('/read-all', controller.markAllAsRead);

// H10.7 — Historial completo
router.get('/', controller.getNotifications);

// Marcar una notificación específica como leída
router.patch('/:id/read', controller.markOneAsRead);

module.exports = router;