const pool = require('../config/db');

const getUserByEmail = async (email) => {
  const query = `
    SELECT
      id,
      nombre,
      correo AS email,
      contrasena AS password,
      rol
    FROM usuarios
    WHERE correo = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [email]);
  return rows[0] || null;
};

module.exports = {
  getUserByEmail,
};
