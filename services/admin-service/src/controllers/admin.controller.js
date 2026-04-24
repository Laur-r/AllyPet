const adminService = require('../services/admin.service');

const getDashboard = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({
      totalUsers: stats.totalUsers || 0,
      adminUsers: stats.adminUsers || 0,
      totalPets: stats.totalPets || 0,
    });
  } catch (error) {
    console.error('getDashboard controller error:', error);
    res.status(500).json({ message: 'Error interno al obtener dashboard' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.json({ users: users || [] });
  } catch (error) {
    console.error('getUsers controller error:', error);
    res.status(500).json({ message: 'Error interno al obtener usuarios' });
  }
};



const activateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await adminService.activateUser(id);
    if (!success) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario activado satisfactoriamente' });
  } catch (error) {
    console.error('activateUser controller error:', error);
    res.status(500).json({ message: 'Error interno al activar usuario' });
  }
};

const deactivateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await adminService.deactivateUser(id);
    if (!success) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario desactivado satisfactoriamente' });
  } catch (error) {
    console.error('deactivateUser controller error:', error);
    res.status(500).json({ message: 'Error interno al desactivar usuario' });
  }
};

const aprobarPaseador = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await adminService.aprobarPaseador(id);
    if (!success) {
      return res.status(404).json({ message: 'Perfil de paseador no encontrado' });
    }
    res.json({ message: 'Paseador aprobado exitosamente' });
  } catch (error) {
    console.error('aprobarPaseador controller error:', error);
    res.status(500).json({ message: 'Error interno al aprobar paseador' });
  }
};

const desaprobarPaseador = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await adminService.desaprobarPaseador(id);
    if (!success) {
      return res.status(404).json({ message: 'Perfil de paseador no encontrado' });
    }
    res.json({ message: 'Paseador desaprobado exitosamente' });
  } catch (error) {
    console.error('desaprobarPaseador controller error:', error);
    res.status(500).json({ message: 'Error interno al desaprobar paseador' });
  }
};

const aprobarVeterinario = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await adminService.aprobarVeterinario(id);
    if (!success) {
      return res.status(404).json({ message: 'Perfil de veterinario no encontrado' });
    }
    res.json({ message: 'Veterinario aprobado exitosamente' });
  } catch (error) {
    console.error('aprobarVeterinario controller error:', error);
    res.status(500).json({ message: 'Error interno al aprobar veterinario' });
  }
};

const desaprobarVeterinario = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await adminService.desaprobarVeterinario(id);
    if (!success) {
      return res.status(404).json({ message: 'Perfil de veterinario no encontrado' });
    }
    res.json({ message: 'Veterinario desaprobado exitosamente' });
  } catch (error) {
    console.error('desaprobarVeterinario controller error:', error);
    res.status(500).json({ message: 'Error interno al desaprobar veterinario' });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  activateUser,
  deactivateUser,
  aprobarPaseador,
  desaprobarPaseador,
  aprobarVeterinario,
  desaprobarVeterinario,
};
