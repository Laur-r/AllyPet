const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const upload = require('../middlewares/upload.middleware');
const auth = require('../middlewares/auth.middleware');

// ⚠️ PRIMERO las rutas específicas /me
router.get('/me',          auth, UserController.getMe);
router.put('/me/info',     auth, UserController.updateBasicInfo);
router.put('/me/foto',     auth, upload.single('foto'), UserController.updateFoto);
router.put('/me/password', auth, UserController.updatePassword);

// DESPUÉS las rutas con parámetro /:id
router.get('/:id',    UserController.getPerfil);
router.put('/:id',    UserController.updatePerfil);
router.delete('/:id', UserController.deleteCuenta);
router.post('/:id/foto', upload.single('foto'), UserController.updateFoto);

module.exports = router;