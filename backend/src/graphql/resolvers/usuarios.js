// src/graphql/resolvers/usuarios.js
// Resolvers de usuarios y autenticación
import * as usuariosRepo from "../../repositories/usuarios.js";
import * as intercambiosRepo from "../../repositories/intercambios.js";
import { comprobarPassword, firmarToken, hashPassword } from "../../services/auth.js";
import { errorValidacion, errorNoEncontrado, requerirAuth } from "../../utils/errores.js";
import { esEmail, longitudEntre } from "../../utils/validacion.js";

const ERROR_LOGIN = "Email o contraseña incorrectos";

/**
 * Valida los datos de alta de un usuario.
 * @param {{ nombre:string, email:string, password:string }} input
 * @throws {import("graphql").GraphQLError} BAD_USER_INPUT indicando el campo que falla.
 */
function validarAlta({ nombre, email, password }) {
    if (!longitudEntre(nombre, 2, 50)) throw errorValidacion("El nombre debe tener entre 2 y 50 caracteres.", "nombre");
    if (!esEmail(email)) throw errorValidacion("Introduce un email válido.", "email");
    if (!longitudEntre(password, 4, 100)) throw errorValidacion("La contraseña debe tener entre 4 y 100 caracteres.", "password");
}

export const resolversUsuarios = {
    Query: {
        // Firma de un resolver: (padre, argumentos, contexto)
        yo: (_, __, contexto) => requerirAuth(contexto),

        usuarios: async (_, __, contexto) => {
            requerirAuth(contexto);
            return usuariosRepo.listar();
        },
    },
    Mutation: {
        // Pública: es la única operación que no exige token
        login: async (_, { email, password }) => {
            const usuario = await usuariosRepo.buscarPorEmail(email);
            if (!usuario) throw errorValidacion(ERROR_LOGIN);

            const correcta = await comprobarPassword(password, usuario.passwordHash);
            if (!correcta) throw errorValidacion(ERROR_LOGIN);

            const token = firmarToken(usuario);
            const { passwordHash, ...usuarioSinHash } = usuario;
            return { token, usuario: usuarioSinHash };
        },

        // El JWT es stateless: no hay nada que invalidar en el servidor, el cliente borra su token
        logout: (_, __, contexto) => {
            requerirAuth(contexto);
            return true;
        },

        altaUsuario: async (_, { input }, contexto) => {
            requerirAuth(contexto);
            validarAlta(input);

            const passwordHash = await hashPassword(input.password);
            const usuario = await usuariosRepo.crear({ nombre: input.nombre.trim(), email: input.email, passwordHash });
            if (!usuario) throw errorValidacion("Ya existe un usuario con este email.", "email");
            return usuario;
        },

        // Borra al usuario y, en cascada, todos sus intercambios
        borrarUsuario: async (_, { email }, contexto) => {
            requerirAuth(contexto);

            const borrado = await usuariosRepo.borrarPorEmail(email);
            if (!borrado) throw errorNoEncontrado("Usuario");

            await intercambiosRepo.borrarPorEmail(email);
            return true;
        },
    },
};
