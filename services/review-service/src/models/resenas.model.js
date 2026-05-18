const pool = require('../config/db');

const ResenaModel = {

  async crearResena(datos) {
    const { 
      solicitud_id,
      dueno_id, 
      proveedor_id, 
      calificacion, 
      comentario, 
      tipo_proveedor 
    } = datos;

    const validacion = await pool.query(
      `SELECT * FROM solicitudes 
       WHERE id = $1 AND dueno_id = $2 AND estado = 'completada'`,
      [solicitud_id, dueno_id]
    );

    if (validacion.rows.length === 0) {
      throw { status: 400, message: 'No puedes calificar esta solicitud' };
    }

    const existe = await pool.query(
      `SELECT id FROM resenas WHERE solicitud_id = $1`,
      [solicitud_id]
    );

    if (existe.rows.length > 0) {
      throw { status: 400, message: 'Esta solicitud ya fue calificada' };
    }

    const query = `
      INSERT INTO resenas 
      (solicitud_id, dueno_id, proveedor_id, tipo_proveedor, calificacion, comentario)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [solicitud_id, dueno_id, proveedor_id, tipo_proveedor, calificacion, comentario];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async obtenerHistorial(dueno_id) {
    const query = `
      SELECT 
        r.id,
        r.calificacion,
        r.comentario,
        r.fecha AS fecha_resena,
        r.solicitud_id,
        u.nombre AS proveedor_nombre,
        u.foto_perfil AS proveedor_foto,
        r.tipo_proveedor AS tipo_servicio
      FROM resenas r
      JOIN usuarios u ON u.id = r.proveedor_id
      WHERE r.dueno_id = $1
      ORDER BY r.fecha DESC;
    `;
    const result = await pool.query(query, [dueno_id]);
    return result.rows;
  },

  async obtenerPorProveedor(proveedor_id) {
    const query = `
      SELECT 
        r.id,
        r.calificacion,
        r.comentario,
        r.fecha,
        u.nombre AS nombre_dueno,
        u.foto_perfil AS foto_dueno,
        r.tipo_proveedor AS tipo_servicio
      FROM resenas r
      JOIN usuarios u ON u.id = r.dueno_id
      WHERE r.proveedor_id = $1
      ORDER BY r.fecha DESC;
    `;
    const result = await pool.query(query, [proveedor_id]);
    return result.rows;
  },

  async obtenerServiciosCalificables(dueno_id) {
    const query = `
      SELECT 
        s.id AS solicitud_id,
        s.paseador_id,
        s.fecha_servicio,
        s.estado,
        u.id AS proveedor_id,
        u.nombre AS proveedor_nombre,
        u.foto_perfil AS proveedor_foto,
        'paseador' AS tipo_servicio,
        r.id AS id_resena,
        r.calificacion,
        r.comentario
      FROM solicitudes s
      INNER JOIN perfil_paseador pp ON pp.id = s.paseador_id
      INNER JOIN usuarios u ON u.id = pp.usuario_id
      LEFT JOIN resenas r ON r.solicitud_id = s.id
      WHERE s.dueno_id = $1 
        AND s.estado = 'completada'
      ORDER BY s.fecha_servicio DESC;
    `;
    const result = await pool.query(query, [dueno_id]);
    return result.rows;
  },

  /* ── Servicios de cuidado calificables por el dueño ── */
async obtenerServiciosCuidadoCalificables(dueno_id) {
  const query = `
    SELECT 
      s.id AS solicitud_id,
      s.cuidador_id,
      TO_CHAR(s.fecha_servicio, 'YYYY-MM-DD') AS fecha_inicio,
      TO_CHAR(s.fecha_fin, 'YYYY-MM-DD')      AS fecha_fin,
      s.estado,
      u.id           AS proveedor_id,
      u.nombre       AS proveedor_nombre,
      u.foto_perfil  AS proveedor_foto,
      'cuidador'     AS tipo_servicio,
      r.id           AS id_resena,
      r.calificacion,
      r.comentario
    FROM solicitudes s
    INNER JOIN perfil_cuidador pc ON pc.id = s.cuidador_id
    INNER JOIN usuarios u ON u.id = pc.usuario_id
    LEFT JOIN resenas r ON r.solicitud_id = s.id
    WHERE s.dueno_id = $1
      AND s.estado = 'completada'
      AND s.cuidador_id IS NOT NULL
    ORDER BY s.fecha_servicio DESC;
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