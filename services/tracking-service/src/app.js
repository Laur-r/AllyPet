require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const trackingRoutes = require('./routes/tracking.routes');

const app  = express();
const PORT = process.env.PORT || 3012;

app.use(cors());
app.use(express.json());

app.use('/api/tracking', trackingRoutes);

app.get('/health', (_, res) => {
  res.json({ service: 'tracking-service', status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`✅ tracking-service corriendo en puerto ${PORT}`);
});