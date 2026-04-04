const authService = require('../services/auth.service');

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
  registrarDueno,
  registrarPaseador,
  registrarVeterinario,
};