const pool = require('../config/db');

/**
 * Obtiene el rol de un usuario por su ID.
 * Usado por el middleware de JWT.
 */
const getUserRoleById = async (userId) => {
  try {
    const query = 'SELECT role, rol FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);
    if (rows.length === 0) return null;
    
    return rows[0].role || rows[0].rol;
  } catch (error) {
    console.error('Error in getUserRoleById:', error);
    return null;
  }
};

/**
 * Obtiene todos los usuarios con sus campos relevantes.
 */
const getAllUsers = async () => {
  try {
    const query = 'SELECT id, nombre, email, role, active, estado, provider_approved as "providerApproved" FROM users ORDER BY id DESC';
    const { rows } = await pool.query(query);
    return rows;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas rápidas para el dashboard.
 */
const getDashboardStats = async () => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const adminUsers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin' OR rol = 'admin'");
    const totalPets = await pool.query('SELECT COUNT(*) FROM pets').catch(() => ({ rows: [{ count: 0 }] }));

    return {
      totalUsers: parseInt(totalUsers.rows[0].count, 10),
      adminUsers: parseInt(adminUsers.rows[0].count, 10),
      totalPets: parseInt(totalPets.rows[0].count, 10),
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    throw error;
  }
};

/**
 * Aprueba un proveedor.
 */
const approveUser = async (userId) => {
  const query = 'UPDATE users SET provider_approved = true WHERE id = $1 RETURNING id';
  const { rows } = await pool.query(query, [userId]);
  return rows.length > 0;
};

/**
 * Rechaza/Desaprueba un proveedor.
 */
const rejectUser = async (userId) => {
  const query = 'UPDATE users SET provider_approved = false WHERE id = $1 RETURNING id';
  const { rows } = await pool.query(query, [userId]);
  return rows.length > 0;
};

/**
 * Desactiva la cuenta de un usuario.
 */
const deactivateUser = async (userId) => {
  const query = 'UPDATE users SET active = false, estado = false WHERE id = $1 RETURNING id';
  const { rows } = await pool.query(query, [userId]);
  return rows.length > 0;
};

module.exports = {
  getUserRoleById,
  getAllUsers,
  getDashboardStats,
  approveUser,
  rejectUser,
  deactivateUser,
};
