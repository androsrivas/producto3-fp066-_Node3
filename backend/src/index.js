// src/index.js
// Punto de entrada del servidor
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { readFileSync } from "node:fs";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { crearContexto } from "./graphql/contexto.js";
import { conectar, cerrar } from "./db/conexion.js";
import { inicializar } from "./db/inicializar.js";
import { resolvers } from "./graphql/resolvers/index.js";
import { crearFormatearError } from "./utils/errores.js";

const app = express();
app.use(cors());
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
const servidorApollo = new ApolloServer({
    typeDefs,
    resolvers,
    // Explícito (no depende de NODE_ENV por defecto): en producción no se envía el stacktrace,
    // porque revelaría rutas locales del servidor.
    includeStacktraceInErrorResponses: !config.produccion,
    formatError: crearFormatearError(config.produccion),
});
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

