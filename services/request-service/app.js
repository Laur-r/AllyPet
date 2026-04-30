require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const solicitudRoutes = require("./src/routes/solicitud.routes");

const app  = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

app.use("/api/solicitudes", solicitudRoutes);

app.get("/health", (_, res) => res.json({ service: "request-service", status: "ok" }));

app.listen(PORT, () => console.log(`request-service corriendo en puerto ${PORT}`));