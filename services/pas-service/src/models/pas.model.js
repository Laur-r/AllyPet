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

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  actualizarServicios,
  actualizarZonas,
  actualizarRazas,
  cambiarDisponibilidad,
  actualizarImagen,
};