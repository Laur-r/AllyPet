const pool = require('../config/db');

/* Obtener perfil por usuario_id (Privado) */
const getByUsuario = async (usuario_id) => {
  if (!usuario_id) throw new Error('usuario_id es requerido');

  const { rows } = await pool.query(
    `SELECT 
      COALESCE(NULLIF(p.nombre_establecimiento, ''), u.nombre) AS nombre,
      u.correo, u.telefono, 
      COALESCE(NULLIF(p.ciudad, ''), u.ciudad) AS ciudad,
      COALESCE(p.foto_perfil, u.foto_perfil) AS foto_perfil,
      p.usuario_id, p.nombre_establecimiento, p.direccion, p.estado,
      p.promedio_estrellas, p.total_resenas, p.aprobado, p.experiencia,
      p.especialidad, p.banner, p.descripcion, p.servicios, p.horarios, p.disponible
     FROM usuarios u
     LEFT JOIN perfil_veterinario p ON u.id = p.usuario_id
     WHERE u.id = $1`,
    [usuario_id]
  );

  return rows[0] || null;
};

/* Crear perfil (si no existe aún) */
const create = async (usuario_id) => {
  await pool.query(
    `INSERT INTO perfil_veterinario (usuario_id)
     VALUES ($1)
     ON CONFLICT (usuario_id) DO NOTHING`,
    [usuario_id]
  );

  // 🔥 SIEMPRE devuelve el perfil después
  const { rows } = await pool.query(
    `SELECT * FROM perfil_veterinario WHERE usuario_id = $1`,
    [usuario_id]
  );

  return rows[0] || null;
};

/* Actualizar datos editables */
const update = async (usuario_id, datos) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Campos de 'usuarios'
    const { nombre } = datos;
    if (nombre !== undefined) {
      await client.query('UPDATE usuarios SET nombre = $1 WHERE id = $2', [nombre, usuario_id]);
    }

    // 2. Campos de 'perfil_veterinario'
    const {
      nombre_establecimiento, direccion, ciudad, estado, especialidad,
      experiencia, descripcion, servicios, horarios, foto_perfil,
      banner, disponible
    } = datos;

    const expSegura = experiencia != null ? Number(experiencia) : null;
    const dispSeguro = disponible != null ? (disponible === true || disponible === 'true') : null;

    const { rows } = await client.query(
      `UPDATE perfil_veterinario
       SET
         nombre_establecimiento = COALESCE($1, nombre_establecimiento),
         direccion              = COALESCE($2, direccion),
         ciudad                 = COALESCE($3, ciudad),
         estado                 = COALESCE($4, estado),
         especialidad           = COALESCE($5, especialidad),
         experiencia            = COALESCE($6, experiencia),
         descripcion            = COALESCE($7, descripcion),
         servicios              = COALESCE($8, servicios),
         horarios               = COALESCE($9, horarios),
         foto_perfil            = COALESCE($10, foto_perfil),
         banner                 = COALESCE($11, banner),
         disponible             = COALESCE($12, disponible)
       WHERE usuario_id = $13
       RETURNING *`,
      [
        nombre_establecimiento || null,
        direccion              || null,
        ciudad                 || null,
        estado                 || null,
        especialidad           || null,
        expSegura,
        descripcion            || null,
        servicios !== undefined ? JSON.stringify(servicios) : null,
        horarios  !== undefined ? JSON.stringify(horarios)  : null,
        foto_perfil || null,
        banner || null,
        dispSeguro,
        usuario_id
      ]
    );

    await client.query('COMMIT');
    return rows[0] || { usuario_id };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ ERROR EN UPDATE VET:', error);
    throw error;
  } finally {
    client.release();
  }
};

/* ──  Buscar veterinarias por ciudad ── */
const buscarPorCiudad = async (ciudad) => {
  const { rows } = await pool.query(
    `SELECT
      u.id,
      p.nombre_establecimiento,
      p.direccion,
      p.servicios,
      p.ciudad
    FROM perfil_veterinario p
    INNER JOIN usuarios u ON u.id = p.usuario_id
    WHERE LOWER(p.ciudad) = LOWER($1)
      AND p.aprobado = true
      AND p.disponible = true
      AND u.estado = true
    ORDER BY p.nombre_establecimiento ASC`,
    [ciudad]
  );
  return rows;
};

/* ── H6.4 — Obtener perfil público veterinaria ── */
const obtenerPerfilPublico = async (usuarioId) => {
  // ── Sincronizar reputación en tiempo real ──
  try {
    await pool.query(
      `UPDATE perfil_veterinario p
       SET promedio_estrellas = sub.promedio,
           total_resenas = sub.total
       FROM (
         SELECT id_proveedor, AVG(calificacion)::DECIMAL(2,1) AS promedio, COUNT(*) AS total
         FROM resenas
         WHERE id_proveedor = $1
         GROUP BY id_proveedor
       ) sub
       WHERE p.usuario_id = sub.id_proveedor`,
      [usuarioId]
    );
  } catch (err) {
    console.warn("No se pudo sincronizar reputación vet:", err.message);
  }

  const { rows } = await pool.query(
    `SELECT
      u.id,
      u.nombre,
      u.correo,
      u.telefono,
      u.ciudad,
      u.foto_perfil,
      p.nombre_establecimiento,
      p.direccion,
      p.promedio_estrellas,
      p.total_resenas,
      p.servicios,
      p.horarios,
      p.banner,
      p.descripcion,
      p.especialidad,
      p.experiencia,
      p.disponible
    FROM usuarios u
    LEFT JOIN perfil_veterinario p ON u.id = p.usuario_id
    WHERE u.id = $1`,
    [usuarioId]
  );
  return rows[0] || null;
};

/* ── Obtener reseñas de la veterinaria ── */
const obtenerResenas = async (proveedorId) => {
  const { rows } = await pool.query(
    `SELECT
      r.id,
      r.calificacion,
      r.comentario,
      r.fecha,
      u.nombre AS dueno_nombre,
      u.foto_perfil AS dueno_foto
    FROM resenas r
    INNER JOIN usuarios u ON u.id = r.id_dueno
    WHERE r.id_proveedor = $1
    ORDER BY r.fecha DESC`,
    [proveedorId]
  );
  return rows;
};

module.exports = { 
  getByUsuario, 
  create, 
  update, 
  buscarPorCiudad,
  obtenerPerfilPublico,
  obtenerResenas,
};