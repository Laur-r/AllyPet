const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }

    const user = await authService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const payload = { sub: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    const userResponse = {
      id: user.id,
      nombre: user.nombre || null,
      email: user.email,
      rol: user.rol || 'usuario',
    };
    const successMessage = `Inicio de sesión exitoso. Bienvenido ${user.nombre || user.email} (${userResponse.rol}).`;

    return res.status(200).json({
      message: successMessage,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('auth.controller login error:', error);
    return res.status(500).json({ message: 'Error interno al iniciar sesión' });
  }
};

module.exports = {
  login,
};
