// src/graphql/resolvers/usuarios.js
// Resolvers de usuarios y autenticación
import * as usuariosRepo from "../../repositories/usuarios.js";
import { comprobarPassword, firmarToken } from "../../services/auth.js";
import { errorValidacion } from "../../utils/errores.js";

const ERROR_LOGIN = "Email o contraseña incorrectos";

export const resolversUsuarios = {
    Query: {},
    Mutation: {
        // Firma de un resolver: (padre, argumentos, contexto)
        login: async (_, { email, password }) => {
            const usuario = await usuariosRepo.buscarPorEmail(email);
            if (!usuario) throw errorValidacion(ERROR_LOGIN);

            const correcta = await comprobarPassword(password, usuario.passwordHash);
            if (!correcta) throw errorValidacion(ERROR_LOGIN);

            const token = firmarToken(usuario);
            const { passwordHash, ...usuarioSinHash } = usuario;
            return { token, usuario: usuarioSinHash };
        }
    }
};