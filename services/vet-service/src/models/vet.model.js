const pool = require('../config/db');

/* Obtener perfil por usuario_id */
const getByUsuario = async (usuario_id) => {
  if (!usuario_id) throw new Error('usuario_id es requerido');

  const { rows } = await pool.query(
    `SELECT id, usuario_id, nombre_establecimiento, direccion, ciudad, estado,
            especialidad, experiencia, descripcion, servicios, horarios,
            foto_perfil, banner, disponible, calificacion, total_resenas, aprobado
     FROM perfil_veterinario
     WHERE usuario_id = $1`,
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
  try { console.log('🧠 usuario_id en update:', usuario_id);
    if (!usuario_id) throw new Error('usuario_id es requerido');

    // 🔒 Normalizar datos
    const {
      nombre_establecimiento,
      direccion,
      ciudad,
      estado,
      especialidad,
      experiencia,
      descripcion,
      servicios,
      horarios,
      foto_perfil,
      banner,
      disponible,
    } = datos;

    const serviciosSeguro = Array.isArray(servicios) ? servicios : null;
const horariosSeguro  = typeof horarios === 'object' && horarios !== null ? horarios : null;

    const disponibleSeguro =
      disponible != null
        ? (disponible === true || disponible === 'true')
        : null;

    const experienciaSegura =
      experiencia != null ? Number(experiencia) : null;

    console.log("UPDATE DATA:", {
      usuario_id,
      nombre_establecimiento,
      servicios: serviciosSeguro,
      horarios: horariosSeguro,
      disponible: disponibleSeguro
    });

    const { rows } = await pool.query(
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
        experienciaSegura,
        descripcion            || null,
        servicios !== undefined ? JSON.stringify(serviciosSeguro) : null,
        horarios  !== undefined ? JSON.stringify(horariosSeguro)  : null,
        foto_perfil || null,
        banner || null,
        disponibleSeguro,
        usuario_id,
      ]
    );

    return rows[0] || null;

  } catch (error) {
    console.error("❌ ERROR EN MODEL:", error);
    throw error;
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
  const { rows } = await pool.query(
    `SELECT
      u.id,
      p.nombre_establecimiento,
      p.direccion,
      p.ciudad,
      p.servicios,
      p.horarios,
      p.foto_perfil,
      p.banner,
      p.descripcion,
      p.especialidad,
      p.experiencia,
      p.disponible,
      p.calificacion,
      p.total_resenas
    FROM perfil_veterinario p
    INNER JOIN usuarios u ON u.id = p.usuario_id
    WHERE p.usuario_id = $1
      AND p.aprobado = true
      AND u.estado = true`,
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
    INNER JOIN usuarios u ON u.id = r.dueno_id
    WHERE r.proveedor_id = $1
      AND r.tipo_proveedor = 'veterinario'
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