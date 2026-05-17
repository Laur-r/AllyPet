const router     = require('express').Router();
const controller = require('../controllers/message.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Todos los endpoints requieren autenticación
router.use(verifyToken);

// H10.1 — Enviar mensaje
router.post('/', controller.sendMessage);

// H10.2 — Listado de conversaciones activas
router.get('/conversations', controller.getConversations);

// H10.5 — Badge: total de mensajes no leídos
router.get('/unread/count', controller.getUnreadCount);

// H10.2 — Mensajes de una conversación (también marca como leídos)
router.get('/:interlocutor_id', controller.getMessages);

module.exports = router;