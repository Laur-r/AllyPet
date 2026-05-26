require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const cron     = require('node-cron');
const pool     = require('./config/db');

const trackingRoutes = require('./routes/tracking.routes');

const app  = express();
const PORT = process.env.PORT || 3012;

app.use(cors());
app.use(express.json());

app.use('/api/tracking', trackingRoutes);

app.get('/health', (_, res) => {
  res.json({ service: 'tracking-service', status: 'ok' });
});

/* ── Cron: cada minuto revisa si hay paseos que deben iniciar ── */
cron.schedule('* * * * *', async () => {
  try {
    const { rows } = await pool.query(
      `UPDATE solicitudes
       SET estado = 'en_curso', fecha_actualizacion = NOW()
       WHERE estado = 'aceptada'
         AND tipo_servicio = 'paseo'
         AND fecha_servicio = CURRENT_DATE
         AND hora_servicio <= CURRENT_TIME
       RETURNING id`
    );
    if (rows.length > 0) {
      console.log(`Cron: ${rows.length} paseo(s) iniciado(s) automáticamente:`, rows.map(r => r.id));
    }
  } catch (err) {
    console.error('❌ Cron error:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`tracking-service corriendo en puerto ${PORT}`);
  console.log(`Cron activo: revisando paseos cada minuto`);
});