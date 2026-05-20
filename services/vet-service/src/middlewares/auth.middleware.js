const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ ok: false, message: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1].trim();

    const secret = process.env.JWT_SECRET || 'allypet_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    console.log('DECODED TOKEN:', decoded);

    //  CORRECTO SEGÚN TU TOKEN
    req.usuario_id = decoded.id;

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