const pool = require('../config/db');

// ─── CARNET COMPLETO ─────────────────────────────────────────────
const getCarnet = async (mascota_id) => {
  const { rows } = await pool.query(
    `SELECT m.id, m.nombre, m.especie, m.raza, m.sexo, m.edad, m.peso, 
            m.color, m.foto, m.notas, m.fecha_registro,
            u.nombre AS dueno_nombre, u.telefono AS dueno_telefono, u.correo AS dueno_email
     FROM mascotas m
     JOIN usuarios u ON u.id = m.usuario_id
     WHERE m.id = $1 AND m.activo IS NOT FALSE`,
    [mascota_id]
  );
  return rows[0] || null;
};

// ─── VACUNAS ─────────────────────────────────────────────────────
const getVacunas = async (mascota_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM vacunas
     WHERE mascota_id = $1
     ORDER BY fecha_aplicacion DESC`,
    [mascota_id]
  );
  return rows;
};

const createVacuna = async ({ mascota_id, nombre, fecha_aplicacion, fecha_proxima, veterinario, notas }) => {
  const { rows } = await pool.query(
    `INSERT INTO vacunas (mascota_id, nombre, fecha_aplicacion, fecha_proxima, veterinario, notas)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [mascota_id, nombre, fecha_aplicacion, fecha_proxima || null, veterinario || null, notas || null]
  );
  return rows[0];
};

const updateVacuna = async (id, mascota_id, { nombre, fecha_aplicacion, fecha_proxima, veterinario, notas }) => {
  const { rows } = await pool.query(
    `UPDATE vacunas
     SET nombre = $1, fecha_aplicacion = $2, fecha_proxima = $3, veterinario = $4, notas = $5
     WHERE id = $6 AND mascota_id = $7
     RETURNING *`,
    [nombre, fecha_aplicacion, fecha_proxima || null, veterinario || null, notas || null, id, mascota_id]
  );
  return rows[0] || null;
};

const deleteVacuna = async (id, mascota_id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM vacunas WHERE id = $1 AND mascota_id = $2`,
    [id, mascota_id]
  );
  return rowCount > 0;
};

// ─── HISTORIAL MÉDICO ─────────────────────────────────────────────
const getHistorial = async (mascota_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM historial_medico
     WHERE mascota_id = $1
     ORDER BY fecha DESC`,
    [mascota_id]
  );
  return rows;
};

const createHistorial = async ({ mascota_id, fecha, tipo, descripcion, veterinario, notas }) => {
  const { rows } = await pool.query(
    `INSERT INTO historial_medico (mascota_id, fecha, tipo, descripcion, veterinario, notas)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [mascota_id, fecha, tipo, descripcion, veterinario || null, notas || null]
  );
  return rows[0];
};

const deleteHistorial = async (id, mascota_id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM historial_medico WHERE id = $1 AND mascota_id = $2`,
    [id, mascota_id]
  );
  return rowCount > 0;
};

// ─── RECORDATORIOS ───────────────────────────────────────────────
const getRecordatorios = async (mascota_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM recordatorios
     WHERE mascota_id = $1
     ORDER BY fecha_programada ASC`,
    [mascota_id]
  );
  return rows;
};

const createRecordatorio = async ({ mascota_id, tipo, nombre, descripcion, fecha_programada }) => {
  const { rows } = await pool.query(
    `INSERT INTO recordatorios (mascota_id, tipo, nombre, descripcion, fecha_programada)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [mascota_id, tipo, nombre, descripcion || null, fecha_programada]
  );
  return rows[0];
};

const deleteRecordatorio = async (id, mascota_id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM recordatorios WHERE id = $1 AND mascota_id = $2`,
    [id, mascota_id]
  );
  return rowCount > 0;
};

// ─── TOKEN QR ────────────────────────────────────────────────────
const getToken = async (mascota_id) => {
  const { rows } = await pool.query(
    `SELECT * FROM carnet_acceso WHERE mascota_id = $1 AND activo = TRUE LIMIT 1`,
    [mascota_id]
  );
  return rows[0] || null;
};

const createToken = async (mascota_id) => {
  // Desactiva tokens anteriores primero
  await pool.query(
    `UPDATE carnet_acceso SET activo = FALSE WHERE mascota_id = $1`,
    [mascota_id]
  );
  const { rows } = await pool.query(
    `INSERT INTO carnet_acceso (mascota_id) VALUES ($1) RETURNING *`,
    [mascota_id]
  );
  return rows[0];
};

const revokeToken = async (mascota_id) => {
  const { rowCount } = await pool.query(
    `UPDATE carnet_acceso SET activo = FALSE WHERE mascota_id = $1`,
    [mascota_id]
  );
  return rowCount > 0;
};

const getCarnetByToken = async (token) => {
  const { rows } = await pool.query(
    `SELECT m.id, m.nombre, m.especie, m.raza, m.sexo, m.edad, m.peso,
            m.color, m.foto, m.notas,
            u.nombre AS dueno_nombre, u.telefono AS dueno_telefono, u.correo AS dueno_email
     FROM carnet_acceso ca
     JOIN mascotas m ON m.id = ca.mascota_id
     JOIN usuarios u ON u.id = m.usuario_id
     WHERE ca.token = $1 AND ca.activo = TRUE AND m.activo IS NOT FALSE`,
    [token]
  );
  return rows[0] || null;
};

module.exports = {
  getCarnet,
  getVacunas, createVacuna, updateVacuna, deleteVacuna,
  getHistorial, createHistorial, deleteHistorial,
  getRecordatorios, createRecordatorio, deleteRecordatorio,
  getToken, createToken, revokeToken, getCarnetByToken
};