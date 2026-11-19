// src/utils/validacion.js
// Validaciones reutilizables (portadas de frontend/js/utils/validacion.js sin la part de DOM).

/** Expresión regular básica para emails. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @param {string} texto
 * @returns {boolean} true si tiene formato de email.
 */
export function esEmail(texto) {
    return EMAIL_RE.test(String(texto).trim());
}

/**
 * @param {string} texto - Fecha con formato AAAA-MM-DD.
 * @returns {boolean} true si el formato es correcto y la fecha existe.
 */
export function esFecha(texto) {
    return /^\d{4}-\d{2}-\d{2}$/.test(texto) && !Number.isNaN(Date.parse(texto));
}

/**
 * @param {string} texto
 * @param {number} min
 * @param {number} max
 * @returns {boolean} true si el texto (sin espacios laterales) tiene entre min y max caracteres.
 */
export function longitudEntre(texto, min, max) {
    const n = String(texto).trim().length;
    return n >= min && n <= max;
}
