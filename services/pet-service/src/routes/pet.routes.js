const express       = require('express');
const router        = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const PetController = require('../controllers/pet.controller');

router.use(verificarToken);

router.get('/',       PetController.getMascotas);
router.get('/:id',    PetController.getMascota);
router.post('/',      PetController.crearMascota);
router.put('/:id',    PetController.actualizarMascota);
router.delete('/:id', PetController.eliminarMascota);

module.exports = router;