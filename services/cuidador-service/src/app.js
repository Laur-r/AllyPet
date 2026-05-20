require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const cuidadorRoutes = require("./routes/cuidador.routes");

const app = express();
const PORT = process.env.PORT || 3011;

/* Middlewares */
app.use(cors());
app.use(express.json());

/* Archivos estáticos */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* Rutas */
app.use("/api/perfil-cuidador", cuidadorRoutes);

/* Health check */
app.get("/health", (_, res) => {
  res.json({
    service: "cuidador-service",
    status: "ok",
  });
});

app.listen(PORT, () => {
  console.log(`✅ cuidador-service corriendo en puerto ${PORT}`);
});