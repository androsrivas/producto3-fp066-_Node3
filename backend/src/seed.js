// src/seed.js
// Carga los datos de ejemplo en MongoDB (npm run seed). Se puede ejecutar varias veces sin duplicar.
import { conectar, cerrar } from "./db/conexion.js";
import { inicializar } from "./db/inicializar.js";
import { cargarDatosDemo } from "./data/demo.js";

try {
    await conectar();
    await inicializar();
    await cargarDatosDemo();
    console.log("Datos de ejemplo cargados");
} catch (error) {
    console.error("No se pudieron cargar los datos de ejemplo:", error);
    process.exitCode = 1; // no process.exit(): así el finally llega a cerrar la conexión
} finally {
    await cerrar();
}

