const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ ok: false, message: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('DECODED TOKEN:', decoded);

    // ✅ CORRECTO SEGÚN TU TOKEN
    req.usuario_id = decoded.sub;

    if (!req.usuario_id) {
      return res.status(401).json({
        ok: false,
        message: 'Token sin usuario_id'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'Token inválido' });
  }
};

module.exports = { verificarToken };