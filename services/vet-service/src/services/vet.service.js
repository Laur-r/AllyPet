const model = require('../models/vet.model');

/* ── Perfil privado ── */
const getPerfil = async (usuario_id) => {
  let perfil = await model.getByUsuario(usuario_id);

  if (!perfil) {
    perfil = await model.create(usuario_id);
  }

  if (perfil.servicios && typeof perfil.servicios === 'string') {
    try { perfil.servicios = JSON.parse(perfil.servicios); } catch { perfil.servicios = []; }
  }
  if (perfil.horarios && typeof perfil.horarios === 'string') {
    try { perfil.horarios = JSON.parse(perfil.horarios); } catch { perfil.horarios = {}; }
  }

  return perfil;
};

/* ── Actualizar perfil ── */
const actualizarPerfil = async (usuario_id, datos) => {
  if (!usuario_id) throw new Error('usuario_id requerido');
  return await model.update(usuario_id, datos);
};

/* ── Buscar por ciudad ── */
const buscarPorCiudad = async (ciudad) => {
  if (!ciudad || ciudad.trim() === '') throw new Error('La ciudad es requerida');
  return await model.buscarPorCiudad(ciudad.trim());
};

/* ── Perfil público ── */
const obtenerPerfilPublico = async (usuario_id) => {
  const perfil = await model.obtenerPerfilPublico(usuario_id);
  if (!perfil) throw new Error('Veterinaria no encontrada o no disponible');

  if (typeof perfil.servicios === 'string') {
    try { perfil.servicios = JSON.parse(perfil.servicios); } catch { perfil.servicios = []; }
  }
  if (typeof perfil.horarios === 'string') {
    try { perfil.horarios = JSON.parse(perfil.horarios); } catch { perfil.horarios = {}; }
  }

  return perfil;
};

/* ── Reseñas ── */
const obtenerResenas = async (proveedorId) => {
  return await model.obtenerResenas(proveedorId);
};

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD
   ─────────────────────────────────────────────────────────────────
   "estado" se infiere porque historial_medico no tiene esa columna:
     fecha pasada  → completada
     fecha hoy     → confirmada
     fecha futura  → pendiente
   ───────────────────────────────────────────────────────────────── */

const getCitasDashboard = async (usuario_id) => {
  const rows = await model.getCitasDashboard(usuario_id);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return rows.map(r => {
    const fechaCita = new Date(r.fecha);
    fechaCita.setHours(0, 0, 0, 0);

    let estado;
    if      (fechaCita < hoy)                        estado = 'completada';
    else if (fechaCita.getTime() === hoy.getTime())  estado = 'confirmada';
    else                                             estado = 'pendiente';

    return {
      id:             r.id,
      fecha:          r.fecha,
      // historial_medico no tiene columna hora; tomamos la hora de fecha_registro
      hora: r.fecha_registro
        ? new Date(r.fecha_registro).toLocaleTimeString('es-CO', {
            hour: '2-digit', minute: '2-digit',
          })
        : '—',
      tipo:           r.tipo,
      descripcion:    r.descripcion,
      mascota_id:     r.mascota_id,
      mascota_nombre: r.mascota_nombre,
      mascota_foto:   r.mascota_foto,
      especie:        r.especie,
      raza:           r.raza,
      dueno:          r.dueno,
      dueno_id:       r.dueno_id,
      estado,
    };
  });
};

const getPacientesDashboard = async (usuario_id) => {
  return await model.getPacientesDashboard(usuario_id);
};

const getEstadisticasDashboard = async (usuario_id) => {
  const rows = await model.getEstadisticasDashboard(usuario_id);

  const citasPorMes = rows.map(r => ({
    mes:   r.mes,
    citas: Number(r.citas),
  }));

  // ingresos en 0 hasta que exista tabla de pagos
  const ingresosPorMes = citasPorMes.map(r => ({
    mes:      r.mes,
    ingresos: 0,
  }));

  return { citasPorMes, ingresosPorMes };
};

module.exports = {
  getPerfil,
  actualizarPerfil,
  buscarPorCiudad,
  obtenerPerfilPublico,
  obtenerResenas,
  // dashboard
  getCitasDashboard,
  getPacientesDashboard,
  getEstadisticasDashboard,
};