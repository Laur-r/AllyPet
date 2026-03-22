const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/user.controller');

router.get('/', (req, res) => {
  res.json({ message: 'Ruta de usuarios funcionando 👤' });
});

router.post('/', createUser);

module.exports = router;