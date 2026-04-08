const pool = require('../config/db');

const getByUsuario = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT id, usuario_id, nombre, raza, edad, peso, foto, fecha_registro
     FROM mascotas
     WHERE usuario_id = $1
     ORDER BY fecha_registro DESC`,
    [usuario_id]
  );
  return rows;
};

const getById = async (id, usuario_id) => {
  const { rows } = await pool.query(
    `SELECT id, usuario_id, nombre, raza, edad, peso, foto, fecha_registro
     FROM mascotas
     WHERE id = $1 AND usuario_id = $2`,
    [id, usuario_id]
  );
  return rows[0] || null;
};

const create = async ({ usuario_id, nombre, raza, edad, peso, foto }) => {
  const { rows } = await pool.query(
    `INSERT INTO mascotas (usuario_id, nombre, raza, edad, peso, foto)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [usuario_id, nombre, raza, edad || null, peso || null, foto || null]
  );
  return rows[0];
};

const update = async (id, usuario_id, { nombre, raza, edad, peso, foto }) => {
  const { rows } = await pool.query(
    `UPDATE mascotas
     SET nombre = $1, raza = $2, edad = $3, peso = $4, foto = $5
     WHERE id = $6 AND usuario_id = $7
     RETURNING *`,
    [nombre, raza, edad || null, peso || null, foto || null, id, usuario_id]
  );
  return rows[0] || null;
};

const remove = async (id, usuario_id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM mascotas WHERE id = $1 AND usuario_id = $2`,
    [id, usuario_id]
  );
  return rowCount > 0;
};

module.exports = { getByUsuario, getById, create, update, remove };