const jwt = require('jsonwebtoken');
const adminService = require('../services/admin.service');

const getTokenFromHeader = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length).trim();
};

const requireAdmin = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado o formato invalido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.sub;
    const email = decoded.email;

    let role = String(decoded.role || decoded.rol || '').toLowerCase();

    if (userId) {
      const roleFromDb = await adminService.getUserRoleById(userId);
      if (roleFromDb) {
        role = String(roleFromDb).toLowerCase();
      }
    }

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: se requiere rol admin' });
    }

    req.user = {
      id: userId,
      email,
      role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
};

module.exports = {
  requireAdmin,
};
