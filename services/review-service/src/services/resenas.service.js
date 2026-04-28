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

  async obtenerServiciosCalificables(id_dueno) {
    return await ResenaModel.obtenerServiciosCalificables(id_dueno);
  },

  async obtenerResenasProveedor(id_proveedor) {
    const resenas = await ResenaModel.obtenerPorProveedor(id_proveedor);
    return resenas.map(r => ({
      id: r.id,
      calificacion: r.calificacion,
      comentario: r.comentario,
      fecha: r.fecha || r.fecha_creacion,
      usuario_dueno: {
        id: r.id_dueno,
        nombre: r.nombre_dueno,
        foto_perfil: r.foto_dueno
      }
    }));
  },

  async obtenerPromedioProveedor(id_proveedor) {
    const resultado = await ResenaModel.obtenerPromedio(id_proveedor);
    return {
      id_proveedor,
      promedio: parseFloat(resultado.promedio) || 0,
      total_resenas: parseInt(resultado.total_resenas) || 0
    };
  }
};

module.exports = ResenaService;
