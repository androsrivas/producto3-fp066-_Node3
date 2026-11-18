// src/utils/errores.js
// Errores GraphQL con un código en extensions.code para que el cliente pueda distinguirlos.
import { GraphQLError } from "graphql";

/**
 * Error de datos de entrada no válidos.
 * @param {string} mensaje
 * @param {string} [campo] - Campo que ha fallado.
 * @returns {GraphQLError}
 */
export function errorValidacion(mensaje, campo) {
    return new GraphQLError(mensaje, { extensions: { code: "BAD_USER_INPUT", campo } });
}

/**
 * Error de recurso inexistente.
 * @param {string} recurso - Por ejemplo "Usuario" o "Intercambio".
 * @returns {GraphQLError}
 */
export function errorNoEncontrado(recurso) {
    return new GraphQLError(`${recurso} no encontrado`, { extensions: { code: "NOT_FOUND" } });
}

/**
 * Comprueba que la petición viene de un usuario autenticado.
 * @param {{ usuario: object|null }} contexto - Contexto de Apollo (ver graphql/contexto.js).
 * @returns {object} El usuario autenticado.
 * @throws {GraphQLError} UNAUTHENTICATED si no hay usuario.
 */
export function requerirAuth(contexto) {
    if (!contexto.usuario) {
        throw new GraphQLError("Debes iniciar sesión para realizar esta operación.", { extensions: { code: "UNAUTHENTICATED", http: { status: 401 } } });
    }
    return contexto.usuario;
}