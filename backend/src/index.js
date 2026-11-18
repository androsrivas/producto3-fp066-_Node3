// src/index.js
// Punto de entrada del servidor
import express from "express";
import cors from "cors";
import { config } from "./config.js";

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar que Express responde
app.get("/healthy", (req, res) => {
    res.json({ estado: "ok", hora: new Date().toISOString() });
});

app.listen(config.port, () => {
    console.log(`Servidor en http://localhost:${config.port}`);
})