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

const approveUser = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await adminService.approveUser(id);
    if (!success) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario aprobado satisfactoriamente' });
  } catch (error) {
    console.error('approveUser controller error:', error);
    res.status(500).json({ message: 'Error interno al aprobar usuario' });
  }
};

const rejectUser = async (req, res) => {
  const { id } = req.params;
  try {
    const success = await adminService.rejectUser(id);
    if (!success) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario rechazado satisfactoriamente' });
  } catch (error) {
    console.error('rejectUser controller error:', error);
    res.status(500).json({ message: 'Error interno al rechazar usuario' });
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

module.exports = {
  getDashboard,
  getUsers,
  approveUser,
  rejectUser,
  deactivateUser,
};
