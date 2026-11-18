// src/repositories/usuarios.js
// Repositorio de usuarios (versión EN MEMORIA). El único módulo que sabe donde se guardan.
// En la Fase 3 se sustituirá por MongoDB manteniendo las mismas funciones,
import { randomUUID } from "node:crypto";

/** @type {Map<string, {id:string, nombre:string, email:string, passwordHash:string}>} */
const usuarios = new Map();

/**
 * Normaliza un email (sin espacios y en minúsuculas), como se hacia en el P2.
 * @param {string} email
 * @returns {string}
 */
const normalizar = (email) => email.trim().toLowerCase();

/**
 * Devuelve todos los usuarios.
 * @returns {Promise<Array<object>>}
 */
export async function listar() {
    return [...usuarios.values()].map((u) => ({ ...u }));
}


/**
 * Busca un usuario por email (incluye el passwordHash, para el login).
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function buscarPorEmail(email) {
    const correo = normalizar(email);
    const usuario = [...usuarios.values()].find((u) => u.email === correo);
    return usuario ? { ...usuario } : null;
}

/**
 * Busca un usuario por id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function buscarPorId(id) {
    const usuario = usuarios.get(id);
    return usuario ? { ...usuario } : null; 
}

/**
 * Crea un usuario. Devuelve null si el email ya existe (equivalente al `false` del P2).
 * @param {{ nombre:string, email:string, passwordHash:string }} datos
 * @returns {Promise<object|null>} El usuario creado o null si está duplicado.
 */
export async function crear({ nombre, email, passwordHash }) {
    if (await buscarPorEmail(email)) return null;
    const usuario = { id: randomUUID(), nombre, email: normalizar(email), passwordHash };
    usuarios.set(usuario.id, usuario);
    return { ...usuario };
}

/**
 * Borra un usuario por email.
 * @param {string} email
 * @returns {Promise<boolean>} true si existía y se ha borrado.
 */
export async function borrarPorEmail(email) {
    const usuario = await buscarPorEmail(email);
    if (!usuario) return false;
    return usuarios.delete(usuario.id);
}
