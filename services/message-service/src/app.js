require('dotenv').config();
const express = require('express');
const cors = require('cors');
const messageRoutes = require('./routes/message.routes');

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(express.json());

app.use('/api/messages', messageRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'message-service' }));

app.listen(PORT, () => {
  console.log(`message-service corriendo en puerto ${PORT}`);
});