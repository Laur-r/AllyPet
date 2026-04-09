const pool = require('../config/db');

const UserModel = {
  // Obtener usuario + perfil dueño por ID
  async getById(id) {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.correo, u.telefono, u.ciudad, u.foto_perfil, u.estado, u.fecha_registro,
              pd.direccion
       FROM usuarios u
       LEFT JOIN perfil_dueno pd ON pd.usuario_id = u.id
       WHERE u.id = $1 AND u.rol = 'dueno'`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Actualizar info personal del usuario
  async updateUsuario(id, { nombre, telefono, ciudad, foto_perfil }) {
    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = COALESCE($1, nombre),
           telefono = COALESCE($2, telefono),
           ciudad = COALESCE($3, ciudad),
           foto_perfil = COALESCE($4, foto_perfil)
       WHERE id = $5
       RETURNING id, nombre, correo, telefono, ciudad, foto_perfil`,
      [nombre, telefono, ciudad, foto_perfil, id]
    );
    return result.rows[0] || null;
  },

  // Actualizar dirección en perfil_dueno
  async updatePerfilDueno(usuario_id, { direccion }) {
    // Upsert: si no existe el perfil, lo crea
    const result = await pool.query(
      `INSERT INTO perfil_dueno (usuario_id, direccion)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id)
       DO UPDATE SET direccion = EXCLUDED.direccion
       RETURNING *`,
      [usuario_id, direccion]
    );
    return result.rows[0];
  },

  // Eliminar cuenta (soft delete: estado = false)
  async deleteUsuario(id) {
    const result = await pool.query(
      `UPDATE usuarios SET estado = FALSE WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = UserModel;