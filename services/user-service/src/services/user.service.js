const UserModel = require('../models/user.model');

const UserService = {
  async getPerfil(id) {
    const user = await UserModel.getById(id);
    if (!user) throw { status: 404, message: 'Usuario no encontrado' };
    return user;
  },

  async updatePerfil(id, body) {
    const { nombre, telefono, ciudad, foto_perfil, direccion } = body;

    const updatedUser = await UserModel.updateUsuario(id, { nombre, telefono, ciudad, foto_perfil });
    if (!updatedUser) throw { status: 404, message: 'Usuario no encontrado' };

    // Si viene dirección, actualizar perfil_dueno también
    if (direccion !== undefined) {
      await UserModel.updatePerfilDueno(id, { direccion });
    }

    return await UserModel.getById(id); // devolver perfil completo actualizado
  },

  async deleteCuenta(id) {
    const deleted = await UserModel.deleteUsuario(id);
    if (!deleted) throw { status: 404, message: 'Usuario no encontrado' };
    return { message: 'Cuenta eliminada correctamente' };
  },
};

module.exports = UserService;