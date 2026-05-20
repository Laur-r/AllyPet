const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    // El auth-service guarda el id en `sub`, normalizamos a `id`
    req.user = { ...decoded, id: decoded.id || decoded.sub };
    next();
  } catch {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = { verifyToken };