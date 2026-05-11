const pool = require('../config/db');

const UserModel = {

  // ── Lectura ──────────────────────────────────────────────────────────────────
  async getById(id) {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.correo, u.telefono, u.ciudad,
              u.foto_perfil, u.estado, u.fecha_registro, pd.direccion
       FROM usuarios u
       LEFT JOIN perfil_dueno pd ON pd.usuario_id = u.id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // ── Actualización general (nombre + contacto) ────────────────────────────────
  async updateUsuario(id, { nombre, telefono, ciudad, foto_perfil }) {
    const result = await pool.query(
      `UPDATE usuarios
       SET nombre      = COALESCE($1, nombre),
           telefono    = COALESCE($2, telefono),
           ciudad      = COALESCE($3, ciudad),
           foto_perfil = COALESCE($4, foto_perfil)
       WHERE id = $5
       RETURNING id, nombre, correo, telefono, ciudad, foto_perfil`,
      [nombre, telefono, ciudad, foto_perfil, id]
    );
    return result.rows[0] || null;
  },

  // ── Actualización solo de teléfono y ciudad (configuración) ─────────────────
  async updateBasicInfo(id, { telefono, ciudad }) {
    const result = await pool.query(
      `UPDATE usuarios
       SET telefono = COALESCE($1, telefono),
           ciudad   = COALESCE($2, ciudad)
       WHERE id = $3
       RETURNING id, nombre, correo, telefono, ciudad, foto_perfil`,
      [telefono || null, ciudad || null, id]
    );
    return result.rows[0] || null;
  },

  // ── Foto ─────────────────────────────────────────────────────────────────────
  async updateFoto(id, foto_perfil) {
    const result = await pool.query(
      `UPDATE usuarios SET foto_perfil = $1 WHERE id = $2
       RETURNING id, nombre, correo, telefono, ciudad, foto_perfil`,
      [foto_perfil, id]
    );
    return result.rows[0] || null;
  },

  // ── Contraseña ───────────────────────────────────────────────────────────────
  async updatePassword(id, hashedPassword) {
    await pool.query(
      `UPDATE usuarios SET contrasena = $1 WHERE id = $2`,
      [hashedPassword, id]
    );
  },

  // ── Perfil dueño (dirección) ─────────────────────────────────────────────────
  async updatePerfilDueno(usuario_id, { direccion }) {
    const result = await pool.query(
      `INSERT INTO perfil_dueno (usuario_id, direccion)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id) DO UPDATE SET direccion = EXCLUDED.direccion
       RETURNING *`,
      [usuario_id, direccion]
    );
    return result.rows[0];
  },

  // ── Soft delete ──────────────────────────────────────────────────────────────
  async deleteUsuario(id) {
    const result = await pool.query(
      `UPDATE usuarios SET estado = FALSE WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows[0] || null;
  },
};

module.exports = UserModel;