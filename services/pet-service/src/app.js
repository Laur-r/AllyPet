require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const petRoutes = require('./routes/pet.routes');

const app  = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/mascotas', petRoutes);

app.get('/health', (_, res) => res.json({ ok: true, service: 'pet-service' }));

app.listen(PORT, () => console.log(`🐾 Pet-service corriendo en puerto ${PORT}`));