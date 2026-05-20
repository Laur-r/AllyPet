const pool = require("../config/db");

/* ── Obtener perfil completo ── */
const obtenerPerfil = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT
      u.nombre, u.correo, u.telefono,
      COALESCE(NULLIF(c.ciudad, ''), u.ciudad) AS ciudad,
      COALESCE(c.foto_perfil, u.foto_perfil)   AS foto_perfil,
      c.usuario_id, c.descripcion, c.tarifa, c.disponibilidad,
      c.aprobado, c.disponible, c.calificacion, c.total_resenas,
      c.experiencia, c.especialidad, c.banner, c.estado
     FROM usuarios u
     LEFT JOIN perfil_cuidador c ON u.id = c.usuario_id
     WHERE u.id = $1`,
    [usuarioId]
  );
  return rows[0] || null;
};

/* ── Crear perfil base si no existe ── */
const crearPerfil = async (usuarioId) => {
  const { rows } = await pool.query(
    `INSERT INTO perfil_cuidador (usuario_id, calificacion, total_resenas, aprobado)
     VALUES ($1, 0, 0, true)
     ON CONFLICT (usuario_id) DO NOTHING
     RETURNING *`,
    [usuarioId]
  );
  return rows[0] || null;
};

/* ── Actualizar campos generales ── */
const actualizarPerfil = async (usuarioId, campos) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Campos de tabla usuarios
    const permitidosUser = ["nombre"];
    const keysUser = Object.keys(campos).filter((k) => permitidosUser.includes(k));
    if (keysUser.length > 0) {
      const sets   = keysUser.map((k, i) => `${k} = $${i + 1}`).join(", ");
      const values = [...keysUser.map((k) => campos[k]), usuarioId];
      await client.query(`UPDATE usuarios SET ${sets} WHERE id = $${values.length}`, values);
    }

    // Campos de tabla perfil_cuidador
    const permitidosCuid = [
      "descripcion", "tarifa", "disponibilidad", "ciudad",
      "foto_perfil", "banner", "especialidad", "experiencia",
      "disponible", "estado",
    ];
    const keysCuid = Object.keys(campos).filter((k) => permitidosCuid.includes(k));

    let perfil = null;
    if (keysCuid.length > 0) {
      const sets   = keysCuid.map((k, i) => `${k} = $${i + 1}`).join(", ");
      const values = [...keysCuid.map((k) => campos[k]), usuarioId];
      const { rows } = await client.query(
        `UPDATE perfil_cuidador SET ${sets} WHERE usuario_id = $${values.length} RETURNING *`,
        values
      );
      perfil = rows[0];
    }

    await client.query("COMMIT");
    return perfil || { usuario_id: usuarioId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/* ── Cambiar disponibilidad (booleano) ── */
const cambiarDisponibilidad = async (usuarioId, disponible) => {
  const { rows } = await pool.query(
    `UPDATE perfil_cuidador SET disponible = $1 WHERE usuario_id = $2 RETURNING disponible`,
    [disponible, usuarioId]
  );
  return rows[0] || null;
};

/* ── Actualizar foto_perfil o banner ── */
const actualizarImagen = async (usuarioId, campo, ruta) => {
  const permitidos = ["foto_perfil", "banner"];
  if (!permitidos.includes(campo)) return null;
  const { rows } = await pool.query(
    `UPDATE perfil_cuidador SET ${campo} = $1 WHERE usuario_id = $2 RETURNING ${campo}`,
    [ruta, usuarioId]
  );
  return rows[0] || null;
};

/* ── Buscar cuidadores por ciudad ── */
const buscarPorCiudad = async (ciudad) => {
  const { rows } = await pool.query(
    `SELECT
      u.id, u.nombre, u.foto_perfil,
      c.tarifa, c.calificacion, c.total_resenas,
      c.disponible, c.ciudad, c.especialidad
     FROM perfil_cuidador c
     INNER JOIN usuarios u ON u.id = c.usuario_id
     WHERE LOWER(c.ciudad) = LOWER($1)
       AND c.aprobado = true
       AND c.disponible = true
       AND u.estado = true
     ORDER BY c.calificacion DESC`,
    [ciudad]
  );
  return rows;
};

/* ── Perfil público ── */
const obtenerPerfilPublico = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT
      u.id, u.nombre, u.correo, u.telefono, u.ciudad, u.foto_perfil,
      c.calificacion, c.total_resenas, c.banner,
      c.descripcion, c.tarifa, c.disponibilidad,
      c.disponible, c.experiencia, c.especialidad, c.estado
     FROM usuarios u
     LEFT JOIN perfil_cuidador c ON u.id = c.usuario_id
     WHERE u.id = $1`,
    [usuarioId]
  );
  return rows[0] || null;
};

/* ── Obtener reseñas del cuidador ── */
const obtenerResenas = async (proveedorId) => {
  const { rows } = await pool.query(
    `SELECT
      r.id, r.calificacion, r.comentario, r.fecha,
      u.nombre AS dueno_nombre, u.foto_perfil AS dueno_foto
     FROM resenas r
     INNER JOIN usuarios u ON u.id = r.dueno_id
     WHERE r.proveedor_id = $1
     ORDER BY r.fecha DESC`,
    [proveedorId]
  );
  return rows;
};

module.exports = {
  obtenerPerfil,
  crearPerfil,
  actualizarPerfil,
  cambiarDisponibilidad,
  actualizarImagen,
  buscarPorCiudad,
  obtenerPerfilPublico,
  obtenerResenas,
};