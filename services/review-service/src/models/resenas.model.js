const pool = require('../config/db');

const ResenaModel = {
  // Crear una nueva reseña
  async crearResena(datos) {
    const { 
      dueno_id, 
      proveedor_id, 
      calificacion, 
      comentario, 
      tipo_proveedor 
    } = datos;
    
    const queryInsert = `
      INSERT INTO resenas (dueno_id, proveedor_id, tipo_proveedor, calificacion, comentario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const valuesInsert = [
      dueno_id, 
      proveedor_id, 
      tipo_proveedor, 
      calificacion, 
      comentario
    ];
    const result = await pool.query(queryInsert, valuesInsert);
    return result.rows[0];
  },

  // REGLA 3: CONSULTA CORRECTA HISTORIAL (DUEÑO)
  async obtenerHistorial(dueno_id) {
    const query = `
      SELECT 
        r.id,
        r.calificacion,
        r.comentario,
        r.fecha,
        r.tipo_proveedor,
        u.nombre,
        u.foto_perfil
      FROM resenas r
      JOIN usuarios u ON u.id = r.proveedor_id
      WHERE r.dueno_id = $1
      ORDER BY r.fecha DESC;
    `;
    const result = await pool.query(query, [dueno_id]);
    return result.rows;
  },

  // REGLA 4: CONSULTA CORRECTA PERFIL PROVEEDOR
  async obtenerPorProveedor(proveedor_id) {
    const query = `
      SELECT 
        r.id,
        r.calificacion,
        r.comentario,
        r.fecha,
        u.nombre AS nombre_dueno,
        u.foto_perfil AS foto_dueno,
        COALESCE(s.tipo_servicio, 
          CASE 
            WHEN p.rol = 'paseador' THEN 'paseo'
            WHEN p.rol = 'veterinario' THEN 'veterinaria'
            ELSE 'servicio'
          END
        ) AS tipo_servicio
      FROM resenas r
      JOIN usuarios u ON u.id = r.dueno_id
      JOIN usuarios p ON p.id = r.proveedor_id
      LEFT JOIN servicios s ON (
        s.id_dueno = r.dueno_id 
        AND s.id_proveedor = r.proveedor_id 
        AND DATE(s.fecha) = DATE(r.fecha)
      )
      WHERE r.proveedor_id = $1
      ORDER BY r.fecha DESC;
    `;
    const result = await pool.query(query, [proveedor_id]);
    return result.rows;
  },

  // Obtener servicios por calificar (Detección inteligente por fecha/dueno/proveedor)
  async obtenerServiciosCalificables(dueno_id) {
    const query = `
      SELECT 
        s.id AS id_servicio,
        s.id_proveedor AS proveedor_id,
        s.tipo_servicio,
        s.fecha AS fecha_servicio,
        u.nombre AS proveedor_nombre,
        u.foto_perfil AS proveedor_foto,
        r.id AS id_resena,
        r.calificacion,
        r.comentario,
        r.fecha AS fecha_resena
      FROM servicios s
      JOIN usuarios u ON s.id_proveedor = u.id
      LEFT JOIN resenas r ON (
        r.dueno_id = s.id_dueno 
        AND r.proveedor_id = s.id_proveedor 
        AND DATE(r.fecha) = DATE(s.fecha)
      )
      WHERE s.id_dueno = $1 AND s.estado = 'completado'
      ORDER BY s.fecha DESC;
    `;
    const result = await pool.query(query, [dueno_id]);
    return result.rows;
  },

  async obtenerPromedio(proveedor_id) {
    const query = `
      SELECT 
        COALESCE(AVG(calificacion), 0)::NUMERIC(10,1) as promedio,
        COUNT(*) as total_resenas
      FROM resenas
      WHERE proveedor_id = $1;
    `;
    const result = await pool.query(query, [proveedor_id]);
    return result.rows[0];
  }
};

module.exports = ResenaModel;