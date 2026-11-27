// src/graphql/resolvers/usuarios.js
// Resolvers de usuarios y autenticación
import * as usuariosRepo from "../../repositories/usuarios.js";
import * as intercambiosRepo from "../../repositories/intercambios.js";
import { comprobarPassword, firmarToken, hashPassword, HASH_FALSO } from "../../services/auth.js";
import { errorValidacion, errorNoEncontrado, errorDemasiadosIntentos, requerirAuth } from "../../utils/errores.js";
import { crearLimitador } from "../../utils/limiteIntentos.js";
import { config } from "../../config.js";
import { esEmail, longitudEntre } from "../../utils/validacion.js";

const ERROR_LOGIN = "Email o contraseña incorrectos";

// Fallos de login por email: tras loginMaxIntentos fallos se bloquea durante la ventana
const limiteLogin = crearLimitador({ max: config.loginMaxIntentos, ventanaMs: config.loginVentanaMs });

// Mismas reglas que el Producto 2 (frontend/js/int_4_usuarios.js)
// Letras (con tildes), espacios, punto, apóstrofo y guion. Debe empezar por letra.
const NOMBRE_RE = /^\p{L}[\p{L} .'-]*$/u;
const PASSWORD_MIN = 4;
const PASSWORD_MAX = 30;

/**
 * Valida los datos de alta de un usuario.
 * @param {{ nombre:string, email:string, password:string }} input
 * @throws {import("graphql").GraphQLError} BAD_USER_INPUT indicando el campo que falla.
 */
function validarAlta({ nombre, email, password }) {
    if (!longitudEntre(nombre, 2, 50) || !NOMBRE_RE.test(nombre.trim())) {
        throw errorValidacion("El nombre debe tener entre 2 y 50 caracteres: letras, espacios, punto, apóstrofo o guion.", "nombre");
    }
    if (!esEmail(email)) throw errorValidacion("Introduce un email válido.", "email");
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX || /\s/.test(password)) {
        throw errorValidacion(`La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres y no puede llevar espacios.`, "password");
    }
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
            const clave = email.trim().toLowerCase();
            const espera = limiteLogin.segundosRestantes(clave);
            if (espera > 0) throw errorDemasiadosIntentos(espera);

            const usuario = await usuariosRepo.buscarPorEmail(email);
            // bcrypt se ejecuta siempre (con un hash de relleno si no existe el usuario) para tardar lo mismo
            const correcta = await comprobarPassword(password, usuario?.passwordHash ?? HASH_FALSO);
            if (!usuario || !correcta) {
                limiteLogin.registrarFallo(clave);
                throw errorValidacion(ERROR_LOGIN);
            }
            limiteLogin.reiniciar(clave);

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

            // Se normaliza una sola vez: el repo de intercambios no hace trim() y, sin esto,
            // " Laura@tandem.com " borraría al usuario pero dejaría sus intercambios huérfanos.
            const correo = email.trim().toLowerCase();

            const borrado = await usuariosRepo.borrarPorEmail(correo);
            if (!borrado) throw errorNoEncontrado("Usuario");

            await intercambiosRepo.borrarPorEmail(correo);
            return true;
        },
    },
};
