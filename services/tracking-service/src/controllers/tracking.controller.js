const service = require('../services/tracking.service');

/* POST /api/tracking/:solicitudId/iniciar */
const iniciarPaseo = async (req, res) => {
  try {
    const paseadorUsuarioId = req.usuario.id;
    const solicitudId = Number(req.params.solicitudId);
    const resultado = await service.iniciarPaseo(solicitudId, paseadorUsuarioId);
    return res.status(200).json({ message: 'Paseo iniciado', data: resultado });
  } catch (err) {
    console.error('iniciarPaseo:', err.message);
    const status = err.message.includes('no encontrada') || err.message.includes('aceptada') ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
};

/* POST /api/tracking/:solicitudId/ubicacion */
const guardarUbicacion = async (req, res) => {
  try {
    const paseadorUsuarioId = req.usuario.id;
    const solicitudId = Number(req.params.solicitudId);
    const { latitud, longitud } = req.body;
    const resultado = await service.guardarUbicacion(solicitudId, paseadorUsuarioId, latitud, longitud);
    return res.status(201).json({ message: 'Ubicación guardada', data: resultado });
  } catch (err) {
    console.error('guardarUbicacion:', err.message);
    const status = err.message.includes('no encontrada') || err.message.includes('en curso') ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
};

/* GET /api/tracking/:solicitudId/ubicacion */
const obtenerUbicacion = async (req, res) => {
  try {
    const duenoId = req.usuario.id;
    const solicitudId = Number(req.params.solicitudId);
    const ubicacion = await service.obtenerUbicacion(solicitudId, duenoId);
    return res.status(200).json({ message: 'Ubicación obtenida', data: ubicacion });
  } catch (err) {
    console.error('obtenerUbicacion:', err.message);
    const status = err.message.includes('no encontrada') || err.message.includes('en curso') ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
};

/* POST /api/tracking/:solicitudId/finalizar */
const finalizarPaseo = async (req, res) => {
  try {
    const paseadorUsuarioId = req.usuario.id;
    const solicitudId = Number(req.params.solicitudId);
    const resultado = await service.finalizarPaseo(solicitudId, paseadorUsuarioId);
    return res.status(200).json({ message: 'Paseo finalizado', data: resultado });
  } catch (err) {
    console.error('finalizarPaseo:', err.message);
    const status = err.message.includes('no encontrada') || err.message.includes('en curso') ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
};

module.exports = {
  iniciarPaseo,
  guardarUbicacion,
  obtenerUbicacion,
  finalizarPaseo,
};