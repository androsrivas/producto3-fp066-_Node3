// src/db/inicializar.js
// Crea las colecciones con validadores $jsonSchema y sus índices (se puede ejecutar en cada arranque)
import { getDb } from "./conexion.js";

/** Validador de la colección de usuarios */
const esquemaUsuarios = {
    $jsonSchema: {
        bsonType: "object",
        required: ["nombre", "email", "passwordHash"],
        properties: {
            nombre: {
                bsonType: "string",
                minLength: 1,
                description: "Nombre del usuario (obligatorio)",
            },
            email: {
                bsonType: "string",
                pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
                description: "Email con formato válido (obligatorio y único)",
            },
            passwordHash: {
                bsonType: "string",
                description: "Hash bcrypt de la contraseña, nunca la contraseña en claro",    
            },
        },
    },
};

/** Validador de la colección de intercambios */
const esquemaIntercambios = {
    $jsonSchema: {
        bsonType: "object",
        required: ["titulo", "email", "fecha", "descripcion", "tipo", "seleccionado"],
        properties: {
            titulo: {
                bsonType: "string",
                minLength: 3,
                maxLength: 100,
                description: "Título entre 3 y 100 caracteres",
            },
            email: {
                bsonType: "string",
                pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
                description: "Email del usuario que lo publica",
            },
            fecha: {
                bsonType: "string",
                pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                description: "Fecha con formato AAAA-MM-DD",
            },
            descripcion: {
                bsonType: "string",
                minLength: 1,
                maxLength: 500,
                description: "Descripción entre 1 y 500 caracteres",
            },
            tipo: {
                enum: ["OFREZCO_IDIOMA", "BUSCO_IDIOMA"],
                description: "Tipo de intercambio (mismo enum que en GraphQL)",
            },
            seleccionado: {
                bsonType: "bool",
                description: "Si está seleccionado en el Dashboard",
            },
        },
    },
};

/**
 * Crea la colección con su validador o, si ya existe, le actualiza el validador.
 * @param {import("mongodb").Db} db
 * @param {string} nombre - Nombre de la colección.
 * @param {object} validador - Objeto { $jsonSchema: ... }.
 * @returns {Promise<void>}
 */
async function prepararColeccion(db, nombre, validador) {
    const existe = await db.listCollections({ name: nombre }).hasNext();

    if (!existe) {
        await db.createCollection(nombre, { validator: validador });
        return;
    }

    await db.command({ collMod: nombre, validator: validador });
}

/**
 * Prepara las colecciones (validadores) y sus índices. Idempotente: se puede llamar en cada arranque.
 * @returns {Promise<void>}
 */
export async function inicializar() {
    const db = getDb();

    await prepararColeccion(db, "usuarios", esquemaUsuarios);
    await prepararColeccion(db, "intercambios", esquemaIntercambios);

    await db.collection("usuarios").createIndex({ email: 1 }, { unique: true });
    await db.collection("intercambios").createIndex({ fecha: 1 });
}
