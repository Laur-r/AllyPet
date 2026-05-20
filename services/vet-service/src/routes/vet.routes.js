const express            = require('express');
const router             = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const upload             = require('../middlewares/upload.middleware');
const VetController      = require('../controllers/vet.controller');

/* ── Rutas públicas (sin token) ── */
router.get('/buscar',             VetController.buscarPorCiudad);
router.get('/publico/:usuarioId', VetController.obtenerPerfilPublico);
router.get('/:usuarioId/resenas', VetController.obtenerResenas);

/* ── Rutas protegidas ── */
router.use(verificarToken);

/* Perfil propio */
router.get('/', VetController.getPerfil);
router.put('/',
  upload.fields([
    { name: 'foto_perfil', maxCount: 1 },
    { name: 'banner',      maxCount: 1 },
  ]),
  VetController.actualizarPerfil
);

/* Dashboard — deben ir ANTES de rutas con :param para evitar conflictos */
router.get('/veterinario/citas',                  VetController.getCitasDashboard);
router.get('/veterinario/pacientes',              VetController.getPacientesDashboard);
router.get('/veterinario/dashboard-estadisticas', VetController.getEstadisticasDashboard);

module.exports = router;