const express = require('express');
const router = express.Router();

const { verificarToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload');
const PetController = require('../controllers/pet.controller'); 
const CarnetRoutes = require('./carnet.routes');
const RecordatorioModel = require('../models/recordatorio.model');

router.use(verificarToken);

router.post('/', upload.single('foto'), PetController.crearMascota);
router.get('/', PetController.getMascotas);
router.get('/:id', PetController.getMascota);
router.put('/:id', upload.single('foto'), PetController.actualizarMascota);
router.delete('/:id', PetController.eliminarMascota);
router.use('/', CarnetRoutes); 

// ✅ Recordatorios
router.get('/:id/recordatorios', async (req, res) => {
  try {
    const { id } = req.params;
    const recordatorios = await RecordatorioModel.getByPetId(id);
    
    res.json({
      ok: true,
      data: recordatorios
    });
  } catch (error) {
    console.error('💥 pet.routes /recordatorios:', error.message);
    res.status(500).json({ ok: false, message: error.message });
  }
});

module.exports = router;