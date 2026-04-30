const ResenaService = require('../services/resenas.service');

/**
 * ResenaController - Controlador del Microservicio de Reseñas
 * ---------------------------------------------------------
 * Este controlador gestiona la reputación de los paseadores y veterinarios.
 * Permite a los dueños de mascotas calificar servicios reales, asegurando
 * que el puntaje (estrellas) que ven los usuarios sea confiable y justo.
 */
const ResenaController = {
  async crearResena(req, res) {
    try {
      // Usar id del dueño desde el token
      const datos = {
        ...req.body,
        dueno_id: req.user.id
      };
      
      const nuevaResena = await ResenaService.crearResena(datos);
      res.status(201).json({
        message: 'Reseña creada con éxito',
        data: nuevaResena
      });
    } catch (err) {
      console.error('Error en crearResena:', err);
      res.status(err.status || 500).json({ 
        error: err.message || 'Error al crear la reseña' 
      });
    }
  },

  async obtenerServiciosCalificables(req, res) {
    try {
      const dueno_id = req.user.id;
      const ResenaModel = require('../models/resenas.model');
      
const pendientes = await ResenaModel.obtenerServiciosCalificables(dueno_id);
const historial = await ResenaModel.obtenerHistorial(dueno_id);
      
      res.json({ pendientes, historial });
    } catch (err) {
      console.error('Error en obtenerServiciosCalificables:', err);
      res.status(500).json({ error: 'Error al obtener la lista de servicios' });
    }
  },

  async obtenerResenas(req, res) {
    try {
      const { id_usuario } = req.params;
      const resenas = await ResenaService.obtenerResenasProveedor(parseInt(id_usuario));
      res.json(resenas);
    } catch (err) {
      console.error('Error en obtenerResenas:', err);
      res.status(err.status || 500).json({ 
        error: err.message || 'Error al obtener las reseñas' 
      });
    }
  },

  async obtenerPromedio(req, res) {
    try {
      const { id_usuario } = req.params;
      const promedio = await ResenaService.obtenerPromedioProveedor(parseInt(id_usuario));
      res.json(promedio);
    } catch (err) {
      console.error('Error en obtenerPromedio:', err);
      res.status(err.status || 500).json({ 
        error: err.message || 'Error al obtener el promedio' 
      });
    }
  }
};

module.exports = ResenaController;
