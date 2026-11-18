// src/services/auth.js
// Hash de contraseñas (bcrypt) y tokens de sesión (JWT).
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const RONDAS_BCRYPT = 10;

/**
 * Genera el hash de una contraseña
 * @param {string} password - Contraseña en claro.
 * @returns {Promise<string>} Hash bcrypt.
 */
export function hashPassword(password) {
    return bcrypt.hash(password, RONDAS_BCRYPT);
}

/**
 * Comprueba una contraseña contra su hash.
 * @param {string} password - Contraseña en claro.
 * @param {string} hash - Hash guardado.
 * @returns {Promise<boolean>} true si coinciden.
 */
export function comprobarPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

/**
 * Firma un JWT con el id del usuario en `sub`.
 * @param {{ id: string, email: string }} usuario
 * @returns {string} Token.
 */
export function firmarToken(usuario) {
    return jwt.sign(
        { sub: usuario.id, email: usuario.email }, // payload, lo que viaja dentro del token
        config.jwtSecret, // clave con la que se firma
        { expiresIn: config.jwtExpires }, // caducidad ("2h")
    );
}

/**
 * Verifica un JWT.
 * @param {string} token
 * @returns {object|null} El contenido del token, o null si es inválido o ha caducado.
 */
export function verificarToken(token) {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch {
        return null;
    }
}