const pool = require("../config/db");

/* ── Obtener perfil completo (Privado) ── */
const obtenerPerfil = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT 
      u.nombre, u.correo, u.telefono, 
      COALESCE(NULLIF(p.ciudad, ''), u.ciudad) AS ciudad,
      COALESCE(p.foto_perfil, u.foto_perfil) AS foto_perfil,
      p.usuario_id, p.descripcion, p.tarifa, p.disponibilidad, p.promedio_estrellas,
      p.total_resenas, p.aprobado, p.experiencia, p.especialidad, p.banner,
      p.disponible, p.zonas, p.razas, p.servicios, p.mascotas_max, p.estado
     FROM usuarios u
     LEFT JOIN perfil_paseador p ON u.id = p.usuario_id
     WHERE u.id = $1`,
    [usuarioId]
  );
  return rows[0] || null;
};

/* ── Crear perfil base si no existe ── */
const crearPerfil = async (usuarioId) => {
  const { rows } = await pool.query(
    `INSERT INTO perfil_paseador (usuario_id, promedio_estrellas, total_resenas, aprobado)
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

    // 1. Campos de la tabla 'usuarios'
    const permitidosUser = ["nombre"];
    const keysUser = Object.keys(campos).filter((k) => permitidosUser.includes(k));
    if (keysUser.length > 0) {
      const setsUser = keysUser.map((k, i) => `${k} = $${i + 1}`).join(", ");
      const valuesUser = keysUser.map((k) => campos[k]);
      valuesUser.push(usuarioId);
      await client.query(`UPDATE usuarios SET ${setsUser} WHERE id = $${valuesUser.length}`, valuesUser);
    }

    // 2. Campos de la tabla 'perfil_paseador'
    const permitidosPas = [
      "especialidad", "descripcion", "tarifa", "disponibilidad",
      "ciudad", "estado", "disponible", "experiencia",
      "mascotas_max", "banner", "foto_perfil"
    ];
    const keysPas = Object.keys(campos).filter((k) => permitidosPas.includes(k));
    
    let perfil = null;
    if (keysPas.length > 0) {
      const setsPas = keysPas.map((k, i) => `${k} = $${i + 1}`).join(", ");
      const valuesPas = keysPas.map((k) => campos[k]);
      valuesPas.push(usuarioId);
      const { rows } = await client.query(
        `UPDATE perfil_paseador SET ${setsPas} WHERE usuario_id = $${valuesPas.length} RETURNING *`,
        valuesPas
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

/* ── Actualizar JSONB: servicios ── */
const actualizarServicios = async (usuarioId, servicios) => {
  const { rows } = await pool.query(
    `UPDATE perfil_paseador SET servicios = $1::jsonb WHERE usuario_id = $2 RETURNING servicios`,
    [JSON.stringify(servicios), usuarioId]
  );
  return rows[0]?.servicios || null;
};

/* ── Actualizar JSONB: zonas ── */
const actualizarZonas = async (usuarioId, zonas) => {
  const { rows } = await pool.query(
    `UPDATE perfil_paseador SET zonas = $1::jsonb WHERE usuario_id = $2 RETURNING zonas`,
    [JSON.stringify(zonas), usuarioId]
  );
  return rows[0]?.zonas || null;
};

/* ── Actualizar JSONB: razas ── */
const actualizarRazas = async (usuarioId, razas) => {
  const { rows } = await pool.query(
    `UPDATE perfil_paseador SET razas = $1::jsonb WHERE usuario_id = $2 RETURNING razas`,
    [JSON.stringify(razas), usuarioId]
  );
  return rows[0]?.razas || null;
};

/* ── Cambiar disponibilidad (booleano) ── */
const cambiarDisponibilidad = async (usuarioId, disponible) => {
  const { rows } = await pool.query(
    `UPDATE perfil_paseador SET disponible = $1 WHERE usuario_id = $2 RETURNING disponible`,
    [disponible, usuarioId]
  );
  return rows[0] || null;
};

/* ── Actualizar foto_perfil o banner (ruta de archivo) ── */
const actualizarImagen = async (usuarioId, campo, ruta) => {
  const camposPermitidos = ["foto_perfil", "banner"];
  if (!camposPermitidos.includes(campo)) return null;

  const { rows } = await pool.query(
    `UPDATE perfil_paseador SET ${campo} = $1 WHERE usuario_id = $2 RETURNING ${campo}`,
    [ruta, usuarioId]
  );
  return rows[0] || null;
};

/* ── Buscar paseadores por ciudad ── */
const buscarPorCiudad = async (ciudad) => {
  const { rows } = await pool.query(
    `SELECT 
      u.id,
      u.nombre,
      u.foto_perfil,
      p.tarifa,
      p.promedio_estrellas AS calificacion,
      p.total_resenas,
      p.disponible,
      p.ciudad
    FROM perfil_paseador p
    INNER JOIN usuarios u ON u.id = p.usuario_id
    WHERE LOWER(p.ciudad) = LOWER($1)
      AND p.aprobado = true
      AND p.disponible = true
      AND u.estado = true
    ORDER BY p.promedio_estrellas DESC`,
    [ciudad]
  );
  return rows;
};

const obtenerPerfilPublico = async (usuarioId) => {
  // ── Sincronizar reputación en tiempo real si es necesario ──
  try {
     await pool.query(
      `UPDATE perfil_paseador p
       SET promedio_estrellas = sub.promedio,
           total_resenas = sub.total
       FROM (
<<<<<<< HEAD
      SELECT proveedor_id, AVG(calificacion)::DECIMAL(2,1) AS promedio, COUNT(*) AS total
=======
         SELECT proveedor_id, AVG(calificacion)::DECIMAL(2,1) AS promedio, COUNT(*) AS total
>>>>>>> defd835 (Sincronización con la nueva tabla de reseñas y corrección de errores en la base de datos para búsqueda y calificaciones)
         FROM resenas
         WHERE proveedor_id = $1
         GROUP BY proveedor_id
       ) sub
       WHERE p.usuario_id = sub.proveedor_id`,
      [usuarioId]
    );
  } catch (err) {
    console.warn("No se pudo sincronizar reputación (posiblemente tabla resenas no accesible):", err.message);
  }

  const { rows } = await pool.query(
    `SELECT 
      u.id,
      u.nombre,
      u.correo,
      u.telefono,
      u.ciudad,
      u.foto_perfil,
      p.promedio_estrellas,
      p.total_resenas,
      p.banner,
      p.descripcion,
      p.tarifa,
      p.disponibilidad,
      p.disponible,
      p.experiencia,
      p.especialidad,
      p.zonas,
      p.razas,
      p.servicios,
      p.mascotas_max
    FROM usuarios u
    LEFT JOIN perfil_paseador p ON u.id = p.usuario_id
    WHERE u.id = $1`,
    [usuarioId]
  );
  return rows[0] || null;
};

/* ── Obtener reseñas del paseador ── */
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
    ORDER BY r.fecha DESC`,
    [proveedorId]
  );
  return rows;
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  actualizarServicios,
  actualizarZonas,
  actualizarRazas,
  cambiarDisponibilidad,
  actualizarImagen,
  buscarPorCiudad, 
  obtenerPerfilPublico,
  obtenerResenas,
};