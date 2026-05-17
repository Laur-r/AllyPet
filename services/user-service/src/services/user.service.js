const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');

const UserService = {

  // ── Ya existían ──────────────────────────────────────────────────────────────
  async getPerfil(id) {
    const user = await UserModel.getById(id);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };
    return user;
  },

  async updatePerfil(id, body) {
    const { nombre, telefono, ciudad, foto_perfil, direccion } = body;
    const updatedUser = await UserModel.updateUsuario(id, { nombre, telefono, ciudad, foto_perfil });
    if (!updatedUser) throw { status: 404, message: 'Usuario no encontrado' };
    if (direccion !== undefined) {
      await UserModel.updatePerfilDueno(id, { direccion });
    }
    return await UserModel.getById(id);
  },

  async deleteCuenta(id) {
    const deleted = await UserModel.deleteUsuario(id);
    if (!deleted) throw { status: 404, message: 'Usuario no encontrado' };
    return { message: 'Cuenta eliminada correctamente' };
  },

  async updateFoto(id, foto_url) {
    const result = await UserModel.updateFoto(id, foto_url);
    if (!result) throw { status: 404, message: 'Usuario no encontrado' };
    return await UserModel.getById(id);
  },

  // ── Nuevos para ConfiguracionPerfil ─────────────────────────────────────────

  // GET /me → devuelve el usuario del token
  async getMe(id) {
    const user = await UserModel.getById(id);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };
    return user;
  },

  // PUT /me/info → solo teléfono y ciudad
  async updateBasicInfo(id, { telefono, ciudad }) {
    const updated = await UserModel.updateBasicInfo(id, { telefono, ciudad });
    if (!updated) throw { status: 404, message: 'Usuario no encontrado' };
    return updated;
  },

  // PUT /me/password → valida actual y guarda nueva
  async updatePassword(id, { passwordActual, passwordNuevo }) {
    const user = await UserModel.getById(id);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };

    const match = await bcrypt.compare(passwordActual, user.contrasena);
    if (!match) throw { status: 400, message: 'La contraseña actual es incorrecta' };

    const hashed = await bcrypt.hash(passwordNuevo, 10);
    await UserModel.updatePassword(id, hashed);
  },
};

module.exports = UserService;