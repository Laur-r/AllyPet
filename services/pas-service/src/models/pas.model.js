const pool = require("../config/db");

/* ── Obtener perfil completo ── */
const obtenerPerfil = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT * FROM perfil_paseador WHERE usuario_id = $1`,
    [usuarioId]
  );
  return rows[0] || null;
};

/* ── Actualizar campos generales ── */
const actualizarPerfil = async (usuarioId, campos) => {
  /* Construye SET dinámico solo con los campos enviados */
  const permitidos = [
    "nombre", "especialidad", "descripcion", "tarifa",
    "disponibilidad", "ciudad", "estado", "disponible",
    "experiencia", "mascotas_max", "banner", "foto_perfil",
  ];

  const keys   = Object.keys(campos).filter((k) => permitidos.includes(k));
  if (keys.length === 0) return null;

  const sets   = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = keys.map((k) => campos[k]);
  values.push(usuarioId);

  const { rows } = await pool.query(
    `UPDATE perfil_paseador SET ${sets} WHERE usuario_id = $${values.length} RETURNING *`,
    values
  );
  return rows[0] || null;
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
      p.calificacion,
      p.disponible,
      p.ciudad
    FROM perfil_paseador p
    INNER JOIN usuarios u ON u.id = p.usuario_id
    WHERE LOWER(p.ciudad) = LOWER($1)
      AND p.aprobado = true
      AND p.disponible = true
      AND u.estado = true
    ORDER BY p.calificacion DESC`,
    [ciudad]
  );
  return rows;
};

/* ── Obtener perfil público del paseador ── */
const obtenerPerfilPublico = async (usuarioId) => {
  const { rows } = await pool.query(
    `SELECT 
      u.id,
      u.nombre,
      p.foto_perfil,
      p.banner,
      p.descripcion,
      p.tarifa,
      p.disponibilidad,
      p.disponible,
      p.calificacion,
      p.total_resenas,
      p.experiencia,
      p.especialidad,
      p.ciudad,
      p.zonas,
      p.razas,
      p.servicios,
      p.mascotas_max
    FROM perfil_paseador p
    INNER JOIN usuarios u ON u.id = p.usuario_id
    WHERE p.usuario_id = $1
      AND p.aprobado = true
      AND u.estado = true`,
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
      AND r.tipo_proveedor = 'paseador'
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