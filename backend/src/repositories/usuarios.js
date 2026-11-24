// src/repositories/usuarios.js
// Repositorio de usuarios (versión MONGODB). Mantiene las mismas funciones que la versión
// en memoria, así que los resolvers y el contexto no cambian. Es el único módulo que sabe
// dónde se guardan los usuarios.
import { ObjectId } from "mongodb";
import { getDb } from "../db/conexion.js";

/** Código de error de MongoDB para una clave duplicada (índice único de email). */
const ERROR_DUPLICADO = 11000;

/**
 * Colección de usuarios.
 * @returns {import("mongodb").Collection}
 */
const coleccion = () => getDb().collection("usuarios");

/**
 * Normaliza un email (sin espacios y en minúsculas), como se hacía en el P2.
 * @param {string} email
 * @returns {string}
 */
const normalizar = (email) => email.trim().toLowerCase();

/**
 * Convierte un documento de Mongo ({ _id: ObjectId }) en el objeto de la app ({ id: string }).
 * @param {object|null} doc
 * @returns {object|null}
 */
function aUsuario(doc) {
    if (!doc) return null;
    const { _id, ...resto } = doc;
    return { id: _id.toString(), ...resto };
}

/** Proyección que deja fuera el hash: solo el login lo necesita. */
const SIN_HASH = { projection: { passwordHash: 0 } };

/**
 * Devuelve todos los usuarios (sin passwordHash).
 * @returns {Promise<Array<object>>}
 */
export async function listar() {
    const docs = await coleccion().find({}, SIN_HASH).sort({ nombre: 1 }).toArray();
    return docs.map(aUsuario);
}

/**
 * Busca un usuario por email. ÚNICO caso que incluye el passwordHash, porque el login
 * necesita compararlo; el resolver lo elimina antes de responder.
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function buscarPorEmail(email) {
    return aUsuario(await coleccion().findOne({ email: normalizar(email) }));
}

/**
 * Busca un usuario por id (sin passwordHash).
 * @param {string} id - Id como texto; si no es un ObjectId válido devuelve null.
 * @returns {Promise<object|null>}
 */
export async function buscarPorId(id) {
    if (!ObjectId.isValid(id)) return null;
    return aUsuario(await coleccion().findOne({ _id: new ObjectId(id) }, SIN_HASH));
}

/**
 * Crea un usuario. Devuelve null si el email ya existe (error 11000 del índice único).
 * @param {{ nombre:string, email:string, passwordHash:string }} datos
 * @returns {Promise<object|null>} El usuario creado (sin hash) o null si está duplicado.
 */
export async function crear({ nombre, email, passwordHash }) {
    const doc = { nombre, email: normalizar(email), passwordHash };
    try {
        const { insertedId } = await coleccion().insertOne(doc);
        return { id: insertedId.toString(), nombre: doc.nombre, email: doc.email };
    } catch (error) {
        if (error.code === ERROR_DUPLICADO) return null;
        throw error;
    }
}

/**
 * Borra un usuario por email.
 * @param {string} email
 * @returns {Promise<boolean>} true si existía y se ha borrado.
 */
export async function borrarPorEmail(email) {
    const { deletedCount } = await coleccion().deleteOne({ email: normalizar(email) });
    return deletedCount === 1;
}
