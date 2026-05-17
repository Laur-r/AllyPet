// services/pet-service/src/recordatorioJob.js
// H10.6 — Recordatorio automático de vacuna próxima

const cron = require('node-cron');
const pool = require('./config/db');

const crearNotificacionesRecordatorios = async () => {
  try {
    console.log('🔔 Ejecutando job de recordatorios de vacunas...');

    // Buscar recordatorios que vencen en exactamente 7 días
    const query = `
      SELECT 
        r.id AS recordatorio_id,
        r.nombre AS nombre_recordatorio,
        r.fecha_programada,
        r.mascota_id,
        m.nombre AS nombre_mascota,
        m.usuario_id
      FROM recordatorios r
      JOIN mascotas m ON m.id = r.mascota_id
      WHERE r.completado = false
        AND r.fecha_programada = CURRENT_DATE + INTERVAL '7 days'
        AND NOT EXISTS (
          SELECT 1 FROM notificaciones n
          WHERE n.usuario_id = m.usuario_id
            AND n.tipo = 'recordatorio_vacuna'
            AND n.descripcion LIKE '%' || r.nombre || '%'
            AND DATE(n.fecha) = CURRENT_DATE
        )
    `;

    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      console.log('✅ No hay recordatorios próximos para notificar hoy.');
      return;
    }

    // Crear una notificación por cada recordatorio encontrado
    for (const rec of rows) {
      await pool.query(
        `INSERT INTO notificaciones (usuario_id, tipo, descripcion)
         VALUES ($1, $2, $3)`,
        [
          rec.usuario_id,
          'recordatorio_vacuna',
          `Tu mascota ${rec.nombre_mascota} tiene pendiente: "${rec.nombre_recordatorio}" en 7 días (${new Date(rec.fecha_programada).toLocaleDateString('es-CO')}).`
        ]
      );
      console.log(`📩 Notificación creada para usuario ${rec.usuario_id} — mascota: ${rec.nombre_mascota}`);
    }

    console.log(`✅ Job completado. ${rows.length} notificación(es) creada(s).`);
  } catch (error) {
    console.error('❌ Error en job de recordatorios:', error);
  }
};

// Ejecutar todos los días a las 8:00 AM
const iniciarJob = () => {
  cron.schedule('0 8 * * *', crearNotificacionesRecordatorios, {
    timezone: 'America/Bogota'
  });
  console.log('⏰ Job de recordatorios programado para las 8:00 AM diariamente.');

  // Ejecutar inmediatamente al iniciar para pruebas
  crearNotificacionesRecordatorios();
};

module.exports = { iniciarJob };