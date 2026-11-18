// src/respositories/intercambios.js
// Repositorio de intercambios y de la selección del Dashboard (versión EN MEMORIA)
import { randomUUID } from "node:crypto";

/** @type {Map<string, {id:string, titulo:string, email:string, fecha:string, descripcion:string, tipo:string}>} */
const intercambios = new Map();

/**
 * Devuelve los intercambios, opcionalmente filtrados por tipos y/o email.
 * @param {{ tipo?:string, email?:string }} [filtro]
 * @returns {Promise<Array<object>>}
 */
export async function listar(filtro = {}) {
    return [...intercambios.values()]
        .filter((i) => !filtro.tipo || i.tipo === filtro.tipo)
        .filter((i) => !filtro.email || i.email === filtro.email.toLowerCase())
        .map((i) => ({ ...i }));
}

/**
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function buscarPorId(id) {
    const intercambio = intercambios.get(id);
    return intercambio ? { ...intercambio } : null;
}

/**
 * Crea un intercambio (ya validado por la capa superior).
 * @param {{ titulo:string, email:string, fecha:string, descripcion:string, tipo:string }} datos
 * @returns {Promise<object>} El intercambio creado con su id.
 */
export async function crear(datos) {
    const intercambio = { ...datos, id: randomUUID(), email: datos.email.toLowerCase(), seleccionado: false };
    intercambios.set(intercambio.id, intercambio);
    return { ...intercambio };
}

/**
 * Borra un intercambio. Si estaba seleccionado, también desaparece de la selección.
 * @param {string} id
 * @returns {Promise<boolean>} true si existía.
 */
export async function borrar(id) {
    return intercambios.delete(id);
}

/**
 * Borrar todos los intercambios de un usuario (para el borrado en cascada).
 * @param {string} email
 * @returns {Promise<number>} Cuantos se han borrado.
 */
export async function borrarPorEmail(email) {
    const propios = await listar({ email });
    propios.forEach((i) => intercambios.delete(i.id));
    return propios.length;
}

/* ------------- SELECCIÓ DEL DASHBOARD ------------- */
/**
 * Marca un intercambio como seleccionado en el Dashboard.
 * No es error si ya lo estaba.
 * @param {string} id
 * @returns {Promise<object|null>} El intercambio actualizado o null si no existe.
 */
export async function seleccionar(id) {
    const intercambio = intercambios.get(id);
    if (!intercambio) return null;
    intercambio.seleccionado = true;
    return { ...intercambio };
}

/**
 * Marca un intercambio como deseleccionado en el Dashboard.
 * No es error si no lo estaba.
 * @param {string} id
 * @returns {Promise<object|null>} El intercambio actualizado o null si no existe.
 */
export async function deseleccionar (id) {
    const intercambio = intercambios.get(id);
    if (!intercambio) return null;
    intercambio.seleccionado = false;
    return { ...intercambio };
}

/**
 * Devuelve los intercambios seleccionados.
 * @returns {Promise<Array<object>>}
 */
export async function listarSeleccionados(filtro = {}) {
    return [...intercambios.values()]
        .filter((i) => !i.seleccionado)
        .map((i) => ({ ...i }));
}
