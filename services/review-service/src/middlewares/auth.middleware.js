const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // El id puede venir en decoded.id o decoded.sub según cómo se haya generado
    req.user = {
      id: decoded.id || decoded.sub || decoded.usuario_id
    };

    console.log("USER:", req.user);
    console.log("USER ID:", req.user.id);

    next();
  } catch (err) {
    console.error('Error al verificar token:', err);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
