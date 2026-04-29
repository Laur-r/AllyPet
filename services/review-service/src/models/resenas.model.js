const pool = require('../config/db');

const ResenaModel = {
  // Crear una nueva reseña y actualizar el perfil del proveedor
  async crearResena(datos) {
    const { id_servicio, dueno_id, proveedor_id, calificacion, comentario, tipo_objetivo } = datos;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const queryInsert = `
        INSERT INTO resenas (id_servicio, dueno_id, proveedor_id, calificacion, comentario)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const valuesInsert = [id_servicio, dueno_id, proveedor_id, calificacion, comentario];
      const result = await client.query(queryInsert, valuesInsert);
      const nuevaResena = result.rows[0];

      // Actualizar perfil_paseador o perfil_veterinario según el tipo
      const tabla = tipo_objetivo === 'paseador' ? 'perfil_paseador' : 'perfil_veterinario';
      
      const queryUpdate = `
        UPDATE ${tabla} t
        SET 
            promedio_estrellas = sub.promedio,
            total_resenas = sub.total
        FROM (
            SELECT proveedor_id, AVG(calificacion)::DECIMAL(2,1) AS promedio, COUNT(*) AS total
            FROM resenas
            WHERE proveedor_id = $1
            GROUP BY proveedor_id
        ) sub
        WHERE t.usuario_id = sub.proveedor_id;
      `;
      
      await client.query(queryUpdate, [proveedor_id]);
      
      await client.query('COMMIT');
      return nuevaResena;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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