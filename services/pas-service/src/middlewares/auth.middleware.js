const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token      = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    const cleanToken = token.trim();
    const secret = process.env.JWT_SECRET || 'allypet_secret_key_2026';
    const decoded = jwt.verify(cleanToken, secret);
    req.usuario   = decoded; // { id, rol, ... }
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

module.exports = verificarToken;