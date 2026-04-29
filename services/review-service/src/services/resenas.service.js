const ResenaModel = require('../models/resenas.model');

const ResenaService = {
  async crearResena(datos) {
    const { id_servicio, calificacion } = datos;

    // 1. Validar calificación
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      throw { status: 400, message: 'La calificación debe estar entre 1 y 5' };
    }

    // 2. Validar que no se haya calificado el mismo servicio
    const yaExiste = await ResenaModel.existeResenaServicio(id_servicio);
    if (yaExiste) {
      throw { status: 400, message: 'Ya has calificado este servicio' };
    }

    // 3. Crear reseña
    return await ResenaModel.crearResena(datos);
  },

  async obtenerServiciosCalificables(dueno_id) {
    return await ResenaModel.obtenerServiciosCalificables(dueno_id);
  },

  async obtenerResenasProveedor(proveedor_id) {
    const resenas = await ResenaModel.obtenerPorProveedor(proveedor_id);
    return resenas.map(r => ({
      id: r.id,
      calificacion: r.calificacion,
      comentario: r.comentario,
      fecha: r.fecha || r.fecha_creacion,
      usuario_dueno: {
        id: r.dueno_id,
        nombre: r.nombre_dueno,
        foto_perfil: r.foto_dueno
      }
    }));
  },

  async obtenerPromedioProveedor(proveedor_id) {
    const resultado = await ResenaModel.obtenerPromedio(proveedor_id);
    return {
      proveedor_id,
      promedio: parseFloat(resultado.promedio) || 0,
      total_resenas: parseInt(resultado.total_resenas) || 0
    };
  }
};

module.exports = ResenaService;
