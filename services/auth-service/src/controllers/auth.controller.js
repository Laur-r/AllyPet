const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

// ── LOGIN ────────────────────────────────────────────
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

// ── REGISTRO DUEÑO ──────────────────────────────────
const registrarDueno = async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono, ciudad, direccion } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }

    const usuario = await authService.registrarDueno({
      nombre, correo, contrasena, telefono, ciudad, direccion
    });

    res.status(201).json({
      mensaje: 'Dueño registrado exitosamente',
      usuario,
    });
  } catch (error) {
    if (error.message === 'El correo ya está registrado') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error en registrarDueno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── REGISTRO PASEADOR ────────────────────────────────
const registrarPaseador = async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono, ciudad, descripcion, tarifa, disponibilidad } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
    }

    const usuario = await authService.registrarPaseador({
      nombre, correo, contrasena, telefono, ciudad, descripcion, tarifa, disponibilidad
    });

    res.status(201).json({
      mensaje: 'Paseador registrado exitosamente',
      usuario,
    });
  } catch (error) {
    if (error.message === 'El correo ya está registrado') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error en registrarPaseador:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── REGISTRO VETERINARIO ─────────────────────────────
const registrarVeterinario = async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono, ciudad, nombre_establecimiento, direccion, servicios, horarios } = req.body;

    if (!nombre || !correo || !contrasena || !nombre_establecimiento) {
      return res.status(400).json({ error: 'Nombre, correo, contraseña y nombre del establecimiento son obligatorios' });
    }

    const usuario = await authService.registrarVeterinario({
      nombre, correo, contrasena, telefono, ciudad, nombre_establecimiento, direccion, servicios, horarios
    });

    res.status(201).json({
      mensaje: 'Veterinario registrado exitosamente',
      usuario,
    });
  } catch (error) {
    if (error.message === 'El correo ya está registrado') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error en registrarVeterinario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  login,
  registrarDueno,
  registrarPaseador,
  registrarVeterinario,
};