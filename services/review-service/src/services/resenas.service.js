const ResenaModel = require('../models/resenas.model');

const ResenaService = {
  async crearResena(datos) {
    const { calificacion, tipo_objetivo } = datos;
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      throw { status: 400, message: 'La calificación debe estar entre 1 y 5 estrellas' };
    }
    // Mapear tipo_objetivo (frontend) a tipo_proveedor (backend)
    const datosFinales = {
      ...datos,
      tipo_proveedor: tipo_objetivo || datos.tipo_proveedor
    };
    return await ResenaModel.crearResena(datosFinales);
  },

  async obtenerServiciosCalificables(dueno_id) {
    return await ResenaModel.obtenerServiciosCalificables(dueno_id);
  },

  // Obtener reseñas para el perfil público del proveedor
  async obtenerResenasProveedor(proveedor_id) {
    const resenas = await ResenaModel.obtenerPorProveedor(proveedor_id);
    return resenas.map(r => ({
      id: r.id,
      calificacion: r.calificacion,
      comentario: r.comentario,
      fecha: r.fecha,
      tipo_servicio: r.tipo_servicio,
      usuario_dueno: {
        nombre: r.nombre_dueno,
        foto_perfil: r.foto_dueno
      }
    }));
  },

  async obtenerPromedioProveedor(proveedor_id) {
    const resultado = await ResenaModel.obtenerPromedio(proveedor_id);
    return {
      promedio: parseFloat(resultado.promedio) || 0,
      total_resenas: parseInt(resultado.total_resenas) || 0
    };
  }
};

module.exports = ResenaService;
