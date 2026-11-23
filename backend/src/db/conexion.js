// src/db/conexion.js
// Conexión única (singleton) a MongoDB con el driver nativo
import { MongoClient } from "mongodb";
import { config } from "../config.js";

/** @type {MongoClient|null} */
let cliente = null;
/** @type {import("mongodb").Db|null} */
let db = null;

/**
 * Conecta con MongoDB una sola vez y devuelve la base de datos.
 * Si ya hay conexión, devuelve la misma.
 * @returns {Promise<import("mongodb").Db>}
 */
export async function conectar() {
    if (db) return db;

    cliente = new MongoClient(config.mongoUri);
    await cliente.connect();
    db = cliente.db(config.mongoDb);
    return db;
}

/**
 * Devuelve la base de datos ya conectada (para los repositorios).
 * @returns {import("mongodb").Db}
 * @throws {Error} Si todavía no se ha llamado a conectar().
 */
export function getDb() {
    if (!db) throw new Error("MongoDB no está conectado: llama antes a conectar().");
    return db;
}

/**
 * Cierra la conexión con MongoDB (si la hay).
 * @returns {Promise<void>}
 */
export async function cerrar() {
    if (!cliente) return;

    await cliente.close();
    cliente = null;
    db = null;
}
