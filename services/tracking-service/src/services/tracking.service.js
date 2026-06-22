const model = require('../models/tracking.model');

const iniciarPaseo = async (solicitudId, paseadorUsuarioId) => {
  const solicitud = await model.verificarSolicitud(solicitudId, paseadorUsuarioId);

  if (!solicitud) {
    throw new Error('Solicitud no encontrada o no te pertenece');
  }

  if (solicitud.estado !== 'aceptada') {
    throw new Error('El paseo solo puede iniciarse si la solicitud está aceptada');
  }

  const actualizada = await model.iniciarPaseo(solicitudId);

  if (!actualizada) {
    throw new Error('No se pudo iniciar el paseo');
  }

  return actualizada;
};

const guardarUbicacion = async (
  solicitudId,
  paseadorUsuarioId,
  latitud,
  longitud
) => {
  const solicitud = await model.verificarSolicitud(
    solicitudId,
    paseadorUsuarioId
  );

  if (!solicitud) {
    throw new Error('Solicitud no encontrada o no te pertenece');
  }

  if (solicitud.estado !== 'en_curso') {
    throw new Error('El paseo no está en curso');
  }

  if (!latitud || !longitud) {
    throw new Error('Latitud y longitud son requeridas');
  }

  return await model.guardarUbicacion(
    solicitudId,
    paseadorUsuarioId,
    latitud,
    longitud
  );
};

const obtenerUbicacion = async (solicitudId, duenoId) => {
  const solicitud = await model.verificarSolicitudDueno(
    solicitudId,
    duenoId
  );

  if (!solicitud) {
    throw new Error('Solicitud no encontrada o no te pertenece');
  }

  if (solicitud.estado !== 'en_curso') {
    throw new Error('El paseo no está en curso');
  }

  const ubicacion = await model.obtenerUltimaUbicacion(solicitudId);

 
  if (!ubicacion) {
    return {
      latitud: null,
      longitud: null,
      mensaje: 'Aún no hay ubicación registrada'
    };
  }

  return ubicacion;
};

const finalizarPaseo = async (solicitudId, paseadorUsuarioId) => {
  const solicitud = await model.verificarSolicitud(
    solicitudId,
    paseadorUsuarioId
  );

  if (!solicitud) {
    throw new Error('Solicitud no encontrada o no te pertenece');
  }

  if (solicitud.estado !== 'en_curso') {
    throw new Error('El paseo no está en curso');
  }

  const actualizada = await model.finalizarPaseo(solicitudId);

  if (!actualizada) {
    throw new Error('No se pudo finalizar el paseo');
  }

  return actualizada;
};

module.exports = {
  iniciarPaseo,
  guardarUbicacion,
  obtenerUbicacion,
  finalizarPaseo,
};