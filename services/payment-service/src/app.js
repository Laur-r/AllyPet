require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const pagoRoutes = require('./routes/pago.routes');

const app  = express();
const PORT = process.env.PORT || 3012;

app.use(cors());
app.use(express.json());

app.use('/pagos', pagoRoutes);

app.get('/health', (_, res) =>
  res.json({ ok: true, service: 'payment-service', port: PORT })
);

app.listen(PORT, () =>
  console.log(`💳 Payment-service corriendo en puerto ${PORT}`)
);