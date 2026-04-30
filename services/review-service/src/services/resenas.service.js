const ResenaModel = require('../models/resenas.model');

/**
 * ResenaService - Capa de negocio para el sistema de reputación.
 * Centraliza la lógica de validación y transformación de datos.
 */
const ResenaService = {
  /**
   * Valida y crea una nueva reseña mapeando campos del frontend.
   */
  async crearResena(datos) {
    const { calificacion, tipo_objetivo } = datos;
    
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      throw { status: 400, message: 'La calificación debe estar entre 1 y 5 estrellas' };
    }

    // Mapear tipo_objetivo (frontend) a tipo_proveedor (backend) para compatibilidad
    const datosFinales = {
      ...datos,
      tipo_proveedor: tipo_objetivo || datos.tipo_proveedor
    };

    return await ResenaModel.crearResena(datosFinales);
  },

  /**
   * Obtiene la lista de servicios que el dueño puede calificar.
   */
  async obtenerServiciosCalificables(dueno_id) {
    return await ResenaModel.obtenerServiciosCalificables(dueno_id);
  },

  /**
   * Obtiene reseñas para el perfil público con el tipo de servicio estandarizado.
   */
  async obtenerResenasProveedor(proveedor_id) {
    const resenas = await ResenaModel.obtenerPorProveedor(proveedor_id);
    
    return resenas.map(r => ({
      id: r.id,
      calificacion: r.calificacion,
      comentario: r.comentario,
      fecha: r.fecha,
      tipo_servicio: r.tipo_servicio, // 'paseo' o 'veterinaria' desde fuente veraz
      usuario_dueno: {
        nombre: r.nombre_dueno,
        foto_perfil: r.foto_dueno
      }
    }));
  },

  /**
   * Obtiene el resumen de reputación (promedio y total).
   */
  async obtenerPromedioProveedor(proveedor_id) {
    const stats = await ResenaModel.obtenerPromedio(proveedor_id);
    return {
      promedio: parseFloat(stats.promedio) || 0,
      total_resenas: parseInt(stats.total_resenas) || 0
    };
  }
};

module.exports = ResenaService;
