const bcrypt = require('bcrypt');
const pool = require('../config/db');

// ── LOGIN ────────────────────────────────────────────
const getUserByEmail = async (email) => {
  const normalizedEmail = String(email || '').trim();
  const query = `
    SELECT
      id,
      nombre,
      correo AS email,
      contrasena AS password,
      rol,
      estado,
      active
    FROM usuarios
    WHERE LOWER(correo) = LOWER($1)
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [normalizedEmail]);
  return rows[0] || null;
};

// ── REGISTRO DUEÑO ──────────────────────────────────
const registrarDueno = async ({ nombre, correo, contrasena, telefono, ciudad, direccion }) => {
  const existe = await pool.query(
    'SELECT id FROM usuarios WHERE correo = $1',
    [correo]
  );
  if (existe.rows.length > 0) {
    throw new Error('El correo ya está registrado');
  }
  const hash = await bcrypt.hash(contrasena, 10);
  const resultado = await pool.query(
    `INSERT INTO usuarios (nombre, correo, contrasena, rol, telefono, ciudad)
     VALUES ($1, $2, $3, 'dueno', $4, $5)
     RETURNING id, nombre, correo, rol`,
    [nombre, correo, hash, telefono || null, ciudad || null]
  );
  const usuario = resultado.rows[0];
  await pool.query(
    `INSERT INTO perfil_dueno (usuario_id, direccion)
     VALUES ($1, $2)`,
    [usuario.id, direccion || null]
  );
  return usuario;
};

// ── REGISTRO PASEADOR ────────────────────────────────
const registrarPaseador = async ({ nombre, correo, contrasena, telefono, ciudad, descripcion, tarifa, disponibilidad }) => {
  const existe = await pool.query(
    'SELECT id FROM usuarios WHERE correo = $1',
    [correo]
  );
  if (existe.rows.length > 0) {
    throw new Error('El correo ya está registrado');
  }
  const hash = await bcrypt.hash(contrasena, 10);
  const resultado = await pool.query(
    `INSERT INTO usuarios (nombre, correo, contrasena, rol, telefono, ciudad)
     VALUES ($1, $2, $3, 'paseador', $4, $5)
     RETURNING id, nombre, correo, rol`,
    [nombre, correo, hash, telefono || null, ciudad || null]
  );
  const usuario = resultado.rows[0];
  await pool.query(
    `INSERT INTO perfil_paseador (usuario_id, descripcion, tarifa, disponibilidad, ciudad)
     VALUES ($1, $2, $3, $4, $5)`,
    [usuario.id, descripcion || null, tarifa || null, disponibilidad || null, ciudad || null]
  );
  return usuario;
};

// ── REGISTRO VETERINARIO ─────────────────────────────
const registrarVeterinario = async ({ nombre, correo, contrasena, telefono, ciudad, nombre_establecimiento, direccion, servicios, horarios }) => {
  const existe = await pool.query(
    'SELECT id FROM usuarios WHERE correo = $1',
    [correo]
  );
  if (existe.rows.length > 0) {
    throw new Error('El correo ya está registrado');
  }
  const hash = await bcrypt.hash(contrasena, 10);
  const resultado = await pool.query(
    `INSERT INTO usuarios (nombre, correo, contrasena, rol, telefono, ciudad)
     VALUES ($1, $2, $3, 'veterinario', $4, $5)
     RETURNING id, nombre, correo, rol`,
    [nombre, correo, hash, telefono || null, ciudad || null]
  );
  const usuario = resultado.rows[0];
  await pool.query(
    `INSERT INTO perfil_veterinario (usuario_id, nombre_establecimiento, direccion, ciudad, servicios, horarios)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [usuario.id, nombre_establecimiento, direccion || null, ciudad || null, servicios || null, horarios || null]
  );
  return usuario;
};

module.exports = {
  getUserByEmail,
  registrarDueno,
  registrarPaseador,
  registrarVeterinario,
};
