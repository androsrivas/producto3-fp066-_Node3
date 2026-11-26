// src/index.js
// Punto de entrada del servidor
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { readFileSync } from "node:fs";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { crearContexto } from "./graphql/contexto.js";
import { conectar, cerrar } from "./db/conexion.js";
import { inicializar } from "./db/inicializar.js";
import { resolvers } from "./graphql/resolvers/index.js";

const app = express();
// Cabeceras de seguridad. Fuera de producción se desactiva solo la CSP para que funcione Apollo Sandbox.
app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false }));
// CORS: solo los orígenes de CORS_ORIGIN; si está vacío, cualquiera (desarrollo)
app.use(cors(config.corsOrigenes.length ? { origin: config.corsOrigenes } : undefined));
app.use(express.json());

// Ruta de prueba para verificar que Express responde
app.get("/healthy", (req, res) => {
    res.json({ estado: "ok", hora: new Date().toISOString() });
});

// Esquema GraphQL (ruta relativa a este fichero, no al directorio desde donde se lanza node)
const typeDefs = readFileSync(new URL("./graphql/typeDefs.graphql", import.meta.url), "utf8");

await conectar();
console.log("Conectado a MongoDB");
await inicializar();
console.log("Colecciones e índices listos");

// Los datos de ejemplo se cargan aparte con: npm run seed
const servidorApollo = new ApolloServer({ typeDefs, resolvers });
await servidorApollo.start();

app.use("/graphql", expressMiddleware(servidorApollo, { context: crearContexto }));

app.listen(config.port, () => {
    console.log(`Servidor en http://localhost:${config.port}`);
});

/** Cierra MongoDB y termina el proceso (Ctrl+C o parada del servidor) */
async function apagar() {
    await cerrar();
    console.log("Conexión con MongoDB cerrada");
    process.exit(0);
}

process.on("SIGINT", apagar); // Ctrl+C
process.on("SIGTERM", apagar); // parada desde Docker / CodeSandbox

