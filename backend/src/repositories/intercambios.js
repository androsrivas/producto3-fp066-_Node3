// src/repositories/intercambios.js
// Repositorio de intercambios y de la selección del Dashboard (versión MONGODB). Mantiene las
// mismas funciones que la versión en memoria, así que los resolvers no cambian. Es el único
// módulo que sabe dónde se guardan los intercambios.
import { ObjectId } from "mongodb";
import { getDb } from "../db/conexion.js";

/**
 * Colección de intercambios.
 * @returns {import("mongodb").Collection}
 */
const coleccion = () => getDb().collection("intercambios");

/** Un ObjectId se escribe como 24 caracteres hexadecimales. */
const ID_VALIDO = /^[0-9a-f]{24}$/i;

/** Orden de los listados: por fecha (hay un índice) y, a igualdad de fecha, por orden de creación. */
const ORDEN = { fecha: 1, _id: 1 };

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
function aIntercambio(doc) {
    if (!doc) return null;
    const { _id, ...resto } = doc;
    return { id: _id.toString(), ...resto };
}

/**
 * Convierte un id de texto en ObjectId.
 * @param {string} id
 * @returns {ObjectId|null} null si el id no tiene un formato válido (así nunca lanza una excepción).
 */
function aObjectId(id) {
    return typeof id === "string" && ID_VALIDO.test(id) ? new ObjectId(id) : null;
}

/**
 * Devuelve los intercambios, opcionalmente filtrados por tipo y/o email.
 * @param {{ tipo?:string, email?:string }} [filtro]
 * @returns {Promise<Array<object>>}
 */
export async function listar(filtro = {}) {
    const consulta = {};
    if (filtro.tipo) consulta.tipo = filtro.tipo;
    if (filtro.email) consulta.email = normalizar(filtro.email);

    const docs = await coleccion().find(consulta).sort(ORDEN).toArray();
    return docs.map(aIntercambio);
}

/**
 * Busca un intercambio por id.
 * @param {string} id - Id como texto; si no es un ObjectId válido devuelve null.
 * @returns {Promise<object|null>}
 */
export async function buscarPorId(id) {
    const _id = aObjectId(id);
    if (!_id) return null;
    return aIntercambio(await coleccion().findOne({ _id }));
}

/**
 * Crea un intercambio (ya validado por la capa superior). Empieza sin seleccionar.
 * @param {{ titulo:string, email:string, fecha:string, descripcion:string, tipo:string }} datos
 * @returns {Promise<object>} El intercambio creado con su id.
 */
export async function crear({ titulo, email, fecha, descripcion, tipo }) {
    const doc = { titulo, email: normalizar(email), fecha, descripcion, tipo, seleccionado: false };
    const { insertedId } = await coleccion().insertOne(doc);
    return aIntercambio({ _id: insertedId, ...doc });
}

/**
 * Borra un intercambio. Si estaba seleccionado, también desaparece de la selección
 * (la selección es un campo del propio documento).
 * @param {string} id
 * @returns {Promise<boolean>} true si existía y se ha borrado.
 */
export async function borrar(id) {
    const _id = aObjectId(id);
    if (!_id) return false;

    const { deletedCount } = await coleccion().deleteOne({ _id });
    return deletedCount === 1;
}

/**
 * Borra todos los intercambios de un usuario (para el borrado en cascada).
 * @param {string} email
 * @returns {Promise<number>} Cuántos se han borrado.
 */
export async function borrarPorEmail(email) {
    const { deletedCount } = await coleccion().deleteMany({ email: normalizar(email) });
    return deletedCount;
}

/* ------------- SELECCIÓN DEL DASHBOARD ------------- */

/**
 * Pone el campo `seleccionado` de un intercambio y devuelve el documento ya actualizado.
 * @param {string} id
 * @param {boolean} valor
 * @returns {Promise<object|null>} El intercambio actualizado o null si no existe.
 */
async function marcar(id, valor) {
    const _id = aObjectId(id);
    if (!_id) return null;

    const doc = await coleccion().findOneAndUpdate(
        { _id },
        { $set: { seleccionado: valor } },
        { returnDocument: "after" },
    );
    return aIntercambio(doc);
}

/**
 * Marca un intercambio como seleccionado en el Dashboard.
 * No es error si ya lo estaba.
 * @param {string} id
 * @returns {Promise<object|null>} El intercambio actualizado o null si no existe.
 */
export async function seleccionar(id) {
    return marcar(id, true);
}

/**
 * Marca un intercambio como deseleccionado en el Dashboard.
 * No es error si no lo estaba.
 * @param {string} id
 * @returns {Promise<object|null>} El intercambio actualizado o null si no existe.
 */
export async function deseleccionar(id) {
    return marcar(id, false);
}

/**
 * Devuelve los intercambios seleccionados.
 * @returns {Promise<Array<object>>}
 */
export async function listarSeleccionados() {
    const docs = await coleccion().find({ seleccionado: true }).sort(ORDEN).toArray();
    return docs.map(aIntercambio);
}
