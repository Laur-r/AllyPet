const UserService = require('../services/user.service');

const UserController = {

  async getPerfil(req, res) {
    try {
      const { id } = req.params;
      const perfil = await UserService.getPerfil(parseInt(id));
      res.json(perfil);
    } catch (err) {
      console.error('ERROR getPerfil:', err);
      res.status(err.status || 500).json({ error: err.message || 'Error interno' });
    }
  },

  async updatePerfil(req, res) {
    try {
      const { id } = req.params;
      const perfil = await UserService.updatePerfil(parseInt(id), req.body);
      res.json(perfil);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || 'Error interno' });
    }
  },

  async deleteCuenta(req, res) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteCuenta(parseInt(id));
      res.json(result);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || 'Error interno' });
    }
  },
async updateFoto(req, res) {
  try {
    console.log('req.user:', req.user);      // ← agrega esto
    console.log('req.file:', req.file);      // ← y esto
    const userId = req.user?.id || req.params.id;
    if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
    const foto_url = `/uploads/${req.file.filename}`;
    const updated = await UserService.updateFoto(parseInt(userId), foto_url);
    res.json(updated);
  } catch (err) {
    console.error('ERROR updateFoto:', err);
    res.status(err.status || 500).json({ error: err.message || 'Error interno' });
  }
},

  async getMe(req, res) {
    try {
      const perfil = await UserService.getMe(req.user.id);
      res.json(perfil);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || 'Error interno' });
    }
  },

  async updateBasicInfo(req, res) {
    try {
      const updated = await UserService.updateBasicInfo(req.user.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || 'Error interno' });
    }
  },

  async updatePassword(req, res) {
    try {
      await UserService.updatePassword(req.user.id, req.body);
      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || 'Error interno' });
    }
  },

};

module.exports = UserController;