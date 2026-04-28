const pool = require('../config/db');

const ResenaModel = {
  // Crear una nueva reseña y actualizar el perfil del proveedor
  async crearResena(datos) {
    const { id_servicio, id_dueno, id_proveedor, calificacion, comentario, tipo_objetivo } = datos;
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const queryInsert = `
        INSERT INTO resenas (id_servicio, id_dueno, id_proveedor, calificacion, comentario)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const valuesInsert = [id_servicio, id_dueno, id_proveedor, calificacion, comentario];
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
            SELECT id_proveedor, AVG(calificacion)::DECIMAL(2,1) AS promedio, COUNT(*) AS total
            FROM resenas
            WHERE id_proveedor = $1
            GROUP BY id_proveedor
        ) sub
        WHERE t.usuario_id = sub.id_proveedor;
      `;
      
      await client.query(queryUpdate, [id_proveedor]);
      
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
  async obtenerServiciosCalificables(id_dueno) {
    const query = `
      SELECT 
        s.id as id_servicio,
        s.id_proveedor,
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
    const result = await pool.query(query, [id_dueno]);
    return result.rows;
  },

  // Obtener todas las reseñas de un proveedor
  async obtenerPorProveedor(id_proveedor) {
    const query = `
      SELECT r.*, u.nombre as nombre_dueno, u.foto_perfil as foto_dueno
      FROM resenas r
      JOIN usuarios u ON r.id_dueno = u.id
      WHERE r.id_proveedor = $1
      ORDER BY r.fecha DESC;
    `;
    const result = await pool.query(query, [id_proveedor]);
    return result.rows;
  },

  // Obtener el promedio de calificaciones de un proveedor
  async obtenerPromedio(id_proveedor) {
    const query = `
      SELECT 
        AVG(calificacion)::NUMERIC(10,1) as promedio,
        COUNT(*) as total_resenas
      FROM resenas
      WHERE id_proveedor = $1;
    `;
    const result = await pool.query(query, [id_proveedor]);
    return result.rows[0];
  }
};

module.exports = ResenaModel;
