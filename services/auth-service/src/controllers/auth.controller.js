const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contrasena son obligatorios' });
    }

    const user = await authService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    // Validación estricta: solo permite si estado es true
    const isActivo = user.estado === true || user.estado === 'true' || user.estado === 1 || user.active === true || user.active === 'true';
    
    if (!isActivo) {
      return res.status(403).json({
        message: 'Tu cuenta está pendiente de aprobación por un administrador',
      });
    }

    const payload = { sub: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    const userResponse = {
      id: user.id,
      nombre: user.nombre || null,
      email: user.email,
      rol: user.rol || 'usuario',
    };
    const successMessage = `Inicio de sesion exitoso. Bienvenido ${user.nombre || user.email} (${userResponse.rol}).`;

    return res.status(200).json({
      message: successMessage,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('auth.controller login error:', error);
    return res.status(500).json({ message: 'Error interno al iniciar sesion' });
  }
};

const registrarDueno = async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono, ciudad, direccion } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Nombre, correo y contrasena son obligatorios' });
    }

    const usuario = await authService.registrarDueno({
      nombre,
      correo,
      contrasena,
      telefono,
      ciudad,
      direccion,
    });

    return res.status(201).json({
      mensaje: 'Dueno registrado exitosamente',
      usuario,
    });
  } catch (error) {
    if (error.message === 'El correo ya esta registrado') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error en registrarDueno:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const registrarPaseador = async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono, ciudad, descripcion, tarifa, disponibilidad } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Nombre, correo y contrasena son obligatorios' });
    }

    const usuario = await authService.registrarPaseador({
      nombre,
      correo,
      contrasena,
      telefono,
      ciudad,
      descripcion,
      tarifa,
      disponibilidad,
    });

    return res.status(201).json({
      mensaje: 'Paseador registrado exitosamente',
      usuario,
    });
  } catch (error) {
    if (error.message === 'El correo ya esta registrado') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error en registrarPaseador:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const registrarVeterinario = async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono, ciudad, nombre_establecimiento, direccion, servicios, horarios } =
      req.body;

    if (!nombre || !correo || !contrasena || !nombre_establecimiento) {
      return res
        .status(400)
        .json({ error: 'Nombre, correo, contrasena y nombre del establecimiento son obligatorios' });
    }

    const usuario = await authService.registrarVeterinario({
      nombre,
      correo,
      contrasena,
      telefono,
      ciudad,
      nombre_establecimiento,
      direccion,
      servicios,
      horarios,
    });

    return res.status(201).json({
      mensaje: 'Veterinario registrado exitosamente',
      usuario,
    });
  } catch (error) {
    if (error.message === 'El correo ya esta registrado') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error en registrarVeterinario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const googleCallbackHandler = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect(`${FRONTEND_URL}/login?error=google`);
  }

  const isActivo = user.estado === true || user.estado === 'true' || user.estado === 1 || user.active === true || user.active === 'true';
  if (!isActivo) {
      const redirectUrl = new URL(`${FRONTEND_URL}/login`);
      redirectUrl.searchParams.set('error', 'inactive');
      redirectUrl.searchParams.set('message', 'Tu cuenta está pendiente de aprobación por un administrador.');
      return res.redirect(redirectUrl.toString());
  }

  const payload = { sub: user.id, email: user.email, rol: user.rol || 'usuario' };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

  const redirectUrl = new URL(`${FRONTEND_URL}/login`);
  redirectUrl.searchParams.set('token', token);
  redirectUrl.searchParams.set(
    'message',
    `Inicio de sesion exitoso. Bienvenido ${user.nombre || user.email} (${user.rol || 'usuario'}).`
  );
  redirectUrl.searchParams.set('name', user.nombre || user.email);
  redirectUrl.searchParams.set('role', user.rol || 'usuario');
  redirectUrl.searchParams.set('email', user.email);

  return res.redirect(redirectUrl.toString());
};

module.exports = {
  login,
  registrarDueno,
  registrarPaseador,
  registrarVeterinario,
  googleCallbackHandler,
};
