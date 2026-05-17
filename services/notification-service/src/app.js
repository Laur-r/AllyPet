require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const notificationRoutes = require('./routes/notification.routes');

const app  = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());

app.use('/api/notifications', notificationRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.listen(PORT, () => {
  console.log(`notification-service corriendo en puerto ${PORT}`);
});