const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams para acceder a :petId

const { verificarToken } = require('../middlewares/auth.middleware');
const CarnetController = require('../controllers/carnet.controller');

// ─── PÚBLICA (sin auth) ──────────────────────────────────────────
router.get('/public/:token', CarnetController.getCarnetPublico);

// ─── PROTEGIDAS ──────────────────────────────────────────────────
router.use(verificarToken);

router.get('/:petId/carnet',                    CarnetController.getCarnet);
router.post('/:petId/vacunas',                  CarnetController.agregarVacuna);
router.put('/:petId/vacunas/:vacunaId',         CarnetController.editarVacuna);
router.delete('/:petId/vacunas/:vacunaId',      CarnetController.eliminarVacuna);
router.post('/:petId/historial',                CarnetController.agregarHistorial);
router.delete('/:petId/historial/:entradaId',   CarnetController.eliminarHistorial);
router.post('/:petId/recordatorios',            CarnetController.agregarRecordatorio);
router.delete('/:petId/recordatorios/:recordatorioId', CarnetController.eliminarRecordatorio);
router.post('/:petId/carnet/token',             CarnetController.generarToken);
router.delete('/:petId/carnet/token',           CarnetController.revocarToken);

module.exports = router;