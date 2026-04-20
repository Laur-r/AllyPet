const express = require('express');
const router = express.Router();


const { verificarToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload');
const PetController = require('../controllers/pet.controller'); // ✅ ARRIBA
const CarnetRoutes = require('./carnet.routes');

router.use(verificarToken);

// SOLO UNA RUTA POST (la de multer)
router.post(
  '/',
  upload.single('foto'),
  PetController.crearMascota
);

router.get('/',       PetController.getMascotas);
router.get('/:id',    PetController.getMascota);
router.put('/:id', upload.single('foto'), PetController.actualizarMascota);
router.delete('/:id', PetController.eliminarMascota);
router.use('/', CarnetRoutes); 

module.exports = router;