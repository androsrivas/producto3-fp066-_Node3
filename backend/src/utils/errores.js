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

/**
 * Crea la función que Apollo usa para dar forma a cada error antes de enviarlo al cliente.
 * Los errores previstos (BAD_USER_INPUT, NOT_FOUND, UNAUTHENTICATED...) pasan tal cual.
 * Los errores inesperados (INTERNAL_SERVER_ERROR: fallo de Mongo, bug...) se registran
 * en el servidor y, en producción, el cliente solo recibe un mensaje genérico, para no
 * filtrar rutas, nombres de colecciones ni datos de conexión.
 * @param {boolean} produccion - true si el servidor corre en producción.
 * @returns {(formateado: object, error: unknown) => object} Función para la opción formatError de Apollo.
 */
export function crearFormatearError(produccion) {
    return (formateado, error) => {
        if (formateado.extensions?.code !== "INTERNAL_SERVER_ERROR") return formateado;

        console.error("Error interno:", error);
        if (!produccion) return formateado;

        return { message: "Error interno del servidor", extensions: { code: "INTERNAL_SERVER_ERROR" } };
    };
}
