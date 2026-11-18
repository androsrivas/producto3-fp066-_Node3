// src/index.js
// Punto de entrada del servidor
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { readFileSync } from "node:fs";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { crearContexto } from "./graphql/contexto.js";

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar que Express responde
app.get("/healthy", (req, res) => {
    res.json({ estado: "ok", hora: new Date().toISOString() });
});

// Esquema GraphQL (ruta relativa a este fichero, no al directorio desde donde se lanza node)
const typeDefs = readFileSync(new URL("./graphql/typeDefs.graphql", import.meta.url), "utf8");

const servidorApollo = new ApolloServer({ typeDefs });
await servidorApollo.start();

app.use("/graphql", expressMiddleware(servidorApollo, { context: crearContexto }));

app.listen(config.port, () => {
    console.log(`Servidor en http://localhost:${config.port}`);
})