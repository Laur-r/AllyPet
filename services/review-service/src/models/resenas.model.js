const pool = require('../config/db');

const ResenaModel = {
  // Crear una nueva reseña y actualizar el perfil del proveedor
  async crearResena(datos) {
    const { 
      id_servicio, 
      id_dueno, dueno_id, 
      id_proveedor, proveedor_id, 
      calificacion, 
      comentario, 
      tipo_objetivo 
    } = datos;
    
    const queryInsert = `
      INSERT INTO resenas (id_servicio, dueno_id, proveedor_id, tipo_proveedor, calificacion, comentario)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const valuesInsert = [
      id_servicio || null, 
      id_dueno || dueno_id, 
      id_proveedor || proveedor_id, 
      tipo_objetivo, 
      calificacion, 
      comentario
    ];
    const result = await pool.query(queryInsert, valuesInsert);
    return result.rows[0];
  },

  // Verificar si ya existe una reseña para este servicio
  async existeResenaServicio(id_servicio) {
    const query = `SELECT id FROM resenas WHERE id_servicio = $1;`;
    const result = await pool.query(query, [id_servicio]);
    return result.rows.length > 0;
  },

  // Obtener servicios completados y calificables para un dueño
  async obtenerServiciosCalificables(dueno_id) {
    const query = `
      SELECT 
        s.id as id_servicio,
        s.id_proveedor as proveedor_id,
        s.tipo_servicio,
        s.fecha as fecha_servicio,
        u.nombre as proveedor_nombre,
        u.foto_perfil as proveedor_foto,
        r.id as id_resena,
        r.calificacion,
        r.comentario,
        r.fecha as fecha_resena
      FROM servicios s
      JOIN usuarios u ON s.id_proveedor = u.id
      LEFT JOIN resenas r ON s.id = r.id_servicio
      WHERE s.id_dueno = $1 AND s.estado = 'completado'
      ORDER BY s.fecha DESC;
    `;
    const result = await pool.query(query, [dueno_id]);
    return result.rows;
  },

  // Obtener todas las reseñas de un proveedor
  async obtenerPorProveedor(proveedor_id) {
    const query = `
      SELECT r.*, u.nombre as nombre_dueno, u.foto_perfil as foto_dueno
      FROM resenas r
      JOIN usuarios u ON r.dueno_id = u.id
      WHERE r.proveedor_id = $1
      ORDER BY r.fecha DESC;
    `;
    const result = await pool.query(query, [proveedor_id]);
    return result.rows;
  },

  // Obtener el promedio de calificaciones de un proveedor
  async obtenerPromedio(proveedor_id) {
    const query = `
      SELECT 
        AVG(calificacion)::NUMERIC(10,1) as promedio,
        COUNT(*) as total_resenas
      FROM resenas
      WHERE proveedor_id = $1;
    `;
    const result = await pool.query(query, [proveedor_id]);
    return result.rows[0];
  }
};

module.exports = ResenaModel;