const UserService = require('../services/user.service');

const UserController = {
  async getPerfil(req, res) {
    try {
      const { id } = req.params;
      const perfil = await UserService.getPerfil(parseInt(id));
      res.json(perfil);
    } catch (err) {
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
};

module.exports = UserController;