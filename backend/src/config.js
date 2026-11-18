// src/config.js
// Lee la configuración del entorno (.env) y falla si falta algo
import "dotenv/config";

/**
 * Devuelve el valor de una variable de entorno obligatoria
 * @param {string} name - Nombre de la variable.
 * @returns {string} Valor de la variable.
 * @throws {Error} Si la variable no está definida.
 */
function required(name) {
    const value = process.env[name];
    if (!value)  throw new Error(`Falta la variable de entorno ${name} (revisa el fichero .env)`);
    return value;
}

/** Configuración de la aplicación */
export const config = {
    port: Number(process.env.PORT) || 4000,
    mongoUri: required("MONGODB_URI"),
    mongoDb: process.env.MONGODB_DB || "tandem",
    jwtSecret: required("JWT_SECRET"),
    jwtExpires: process.env.JWT_EXPIRES || "2h",
};
