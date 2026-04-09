require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const perfilRoutes = require("./routes/pas.routes");

const app  = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

/* Archivos subidos accesibles en /uploads */
app.use("/uploads", express.static("uploads"));

/* Rutas */
app.use("/api/perfil-paseador", perfilRoutes);

/* Health check */
app.get("/health", (_, res) => res.json({ service: "pas-service", status: "ok" }));

app.listen(PORT, () => console.log(`pas-service corriendo en puerto ${PORT}`));