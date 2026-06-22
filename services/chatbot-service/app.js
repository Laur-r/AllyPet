import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import chatbotRoutes from "./src/routes/chatbot.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/chatbot", chatbotRoutes);

const PORT = process.env.PORT || 3014;

app.listen(PORT, () => {
  console.log(`Chatbot service running on port ${PORT}`);
});