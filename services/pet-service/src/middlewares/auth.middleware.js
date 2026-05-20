const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ ok: false, message: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ ok: false, message: 'Token mal formado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario_id = decoded.sub;
    req.rol = decoded.rol || decoded.role || null; 
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Token inválido o expirado' });
  }
};

const verificarVeterinario = (req, res, next) => {
  if (req.rol !== 'veterinario') {
    return res.status(403).json({ ok: false, message: 'Solo veterinarios pueden acceder' });
  }
  next();
};

module.exports = { verificarToken, verificarVeterinario };