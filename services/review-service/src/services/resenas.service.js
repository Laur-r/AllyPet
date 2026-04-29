const ResenaModel = require('../models/resenas.model');

const ResenaService = {
  async crearResena(datos) {
    const { calificacion } = datos;
    if (!calificacion || calificacion < 1 || calificacion > 5) {
      throw { status: 400, message: 'La calificación debe estar entre 1 y 5 estrellas' };
    }
    return await ResenaModel.crearResena(datos);
  },

  /**
   * SOLUCIÓN DEFINITIVA: 
   * Obtiene el rol real desde la tabla 'usuarios' para no confiar en 'tipo_proveedor'.
   */
  async obtenerResenasProveedor(proveedor_id) {
    const query = `
      SELECT 
        r.id,
        r.calificacion,
        r.comentario,
        r.fecha,
        u_prov.rol AS proveedor_rol, -- Fuente de verdad
        u_dueno.id AS dueno_id,
        u_dueno.nombre AS dueno_nombre,
        u_dueno.foto_perfil AS dueno_foto
      FROM resenas r
      JOIN usuarios u_prov ON r.proveedor_id = u_prov.id
      JOIN usuarios u_dueno ON r.dueno_id = u_dueno.id
      WHERE r.proveedor_id = $1
      ORDER BY r.fecha DESC;
    `;
    const { rows } = await require('../config/db').query(query, [proveedor_id]);

    return rows.map(r => ({
      id: r.id,
      calificacion: r.calificacion,
      comentario: r.comentario,
      fecha: r.fecha,
      tipo_proveedor: r.proveedor_rol, // Usamos el ROL real de la BD
      usuario_dueno: {
        id: r.dueno_id,
        nombre: r.dueno_nombre,
        foto_perfil: r.dueno_foto
      }
    }));
  },

  async obtenerPromedioProveedor(proveedor_id) {
    const query = `
      SELECT AVG(calificacion)::DECIMAL(2,1) as promedio, COUNT(*) as total
      FROM resenas WHERE proveedor_id = $1
    `;
    const { rows } = await require('../config/db').query(query, [proveedor_id]);
    return {
      promedio: rows[0].promedio || 0,
      total_resenas: rows[0].total || 0
    };
  }
};

module.exports = ResenaService;
