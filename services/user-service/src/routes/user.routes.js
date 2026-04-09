const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');

router.get('/:id', UserController.getPerfil);
router.put('/:id', UserController.updatePerfil);
router.delete('/:id', UserController.deleteCuenta);

module.exports = router;