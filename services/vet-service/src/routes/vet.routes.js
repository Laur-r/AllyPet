const express            = require('express');
const router             = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const upload             = require('../middlewares/upload.middleware');
const VetController      = require('../controllers/vet.controller');

/* ──  Buscar veterinarias por ciudad (pública) ── */
router.get('/buscar', VetController.buscarPorCiudad);

/* ── Perfil público veterinaria (pública) ── */
router.get('/publico/:usuarioId', VetController.obtenerPerfilPublico);

/* ── Reseñas de la veterinaria (pública) ── */
router.get('/:usuarioId/resenas', VetController.obtenerResenas);

router.use(verificarToken);

router.get('/', VetController.getPerfil);

// fields acepta foto_perfil y banner como archivos separados
router.put('/',
  upload.fields([
    { name: 'foto_perfil', maxCount: 1 },
    { name: 'banner',      maxCount: 1 },
  ]),
  VetController.actualizarPerfil
);

module.exports = router;