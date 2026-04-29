const pool = require('../config/db');

const ResenaModel = {
  /**
   * Crea una reseña vinculando dueño y proveedor por sus IDs de usuario.
   */
  async crearResena(datos) {
    const { dueno_id, proveedor_id, calificacion, comentario, tipo_proveedor } = datos;
    const query = `
      INSERT INTO resenas (dueno_id, proveedor_id, tipo_proveedor, calificacion, comentario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [dueno_id, proveedor_id, tipo_proveedor, calificacion, comentario];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Obtiene servicios de la tabla 'servicios' con su TIPO REAL.
   */
  async obtenerServiciosPorCalificar(dueno_id) {
    const query = `
      SELECT 
        s.id AS id_solicitud,
        s.id_proveedor AS proveedor_id,
        u.nombre AS proveedor_nombre,
        u.foto_perfil AS proveedor_foto,
        s.tipo_servicio, -- <-- USAR EL TIPO REAL DE LA BD
        s.fecha AS fecha_servicio
      FROM servicios s
      JOIN usuarios u ON s.id_proveedor = u.id
      LEFT JOIN resenas r ON (r.dueno_id = s.id_dueno AND r.proveedor_id = s.id_proveedor)
      WHERE s.id_dueno = $1 
        AND LOWER(TRIM(s.estado)) = 'completado'
        AND r.id IS NULL
      ORDER BY s.id DESC;
    `;
    const result = await pool.query(query, [dueno_id]);
    return result.rows || [];
  },

  /**
   * Obtiene el historial de reseñas con el tipo de proveedor real.
   */
  async obtenerHistorial(dueno_id) {
    const query = `
      SELECT 
        r.id,
        u.nombre AS proveedor_nombre,
        u.foto_perfil AS proveedor_foto,
        r.tipo_proveedor AS tipo_servicio,
        r.calificacion,
        r.comentario,
        r.fecha AS fecha_resena
      FROM resenas r
      JOIN usuarios u ON r.proveedor_id = u.id
      WHERE r.dueno_id = $1
      ORDER BY r.fecha DESC;
    `;
    const result = await pool.query(query, [dueno_id]);
    return result.rows || [];
  }
};

module.exports = ResenaModel;