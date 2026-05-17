const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('token recibido:', token ? 'existe' : 'NO EXISTE');

  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { ...decoded, id: decoded.id || decoded.sub };
    next();
  } catch (err) {
    console.log('error jwt:', err.message); // ← y esto
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = { verifyToken };