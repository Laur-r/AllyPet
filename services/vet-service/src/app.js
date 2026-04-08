require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const vetRoutes = require('./routes/vet.routes');

const app  = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Servir imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/perfil-vet', vetRoutes);
app.get('/health', (_, res) => res.json({ ok: true, service: 'vet-service' }));

app.listen(PORT, () => console.log(`🏥 Vet-service corriendo en puerto ${PORT}`));