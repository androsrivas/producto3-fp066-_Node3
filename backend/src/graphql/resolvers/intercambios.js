// Resolvers de intercambios y de la selección del Dashboard
import * as intercambiosRepo from "../../repositories/intercambios.js";
import * as usuariosRepo from "../../repositories/usuarios.js";
import { errorNoEncontrado, errorValidacion, requerirAuth } from "../../utils/errores.js";
import { esEmail, esFecha, longitudEntre } from "../../utils/validacion.js";

/**
 * El tipo no se comprueba aquí: el enum TipoIntercambio del esquema ya rechaza valores no válidos.
 * @param {{ titulo:string, email:string, fecha:string, descripcion:string }} datos
 * @throws {GraphQLError} BAD_USER_INPUT si algún campo no es válido o el email no existe.
 */
async function validarIntercambio({ titulo, email, fecha, descripcion }) {
    if (!longitudEntre(titulo, 3, 100)) {
        throw errorValidacion("El título debe tener entre 3 y 100 caracteres.", "titulo");
    }
    if (!esEmail(email)) {
        throw errorValidacion("Introduce un email válido.", "email");
    }
    if (!esFecha(fecha)) {
        throw errorValidacion("La fecha debe tener el formato AAAA-MM-DD.", "fecha");
    }
    if (!longitudEntre(descripcion, 1, 500)) {
        throw errorValidacion("La descripción debe tener entre 1 y 500 caracteres.", "descripcion");
    }
    if (!(await usuariosRepo.buscarPorEmail(email))) {
        throw errorValidacion("No existe ningún usuario con ese email.", "email");
    }
}

export const resolversIntercambios = {
    Query: {
        // filtro es null si no se envía, y el repositorio solo asume un objeto vacío con undefined
        intercambios: async (_, { filtro }, contexto) => {
            requerirAuth(contexto);
            return intercambiosRepo.listar(filtro ?? {});
        },

        seleccionados: async (_, __, contexto) => {
            requerirAuth(contexto);
            return intercambiosRepo.listarSeleccionados();
        },
    },

    Mutation: {
        altaIntercambio: async (_, { input }, contexto) => {
            requerirAuth(contexto);
            await validarIntercambio(input);
            return intercambiosRepo.crear(input);
        },

        borrarIntercambio: async (_, { id }, contexto) => {
            requerirAuth(contexto);
            return intercambiosRepo.borrar(id);
        },

        seleccionarIntercambio: async (_, { id }, contexto) => {
            requerirAuth(contexto);
            const intercambio = await intercambiosRepo.seleccionar(id);
            if (!intercambio) throw errorNoEncontrado("Intercambio");
            return intercambio;
        },

        deseleccionarIntercambio: async (_, { id }, contexto) => {
            requerirAuth(contexto);
            const intercambio = await intercambiosRepo.deseleccionar(id);
            if (!intercambio) throw errorNoEncontrado("Intercambio");
            return intercambio;
        },
    },


    // Usuario no tiene passwordHash en el esquema, así que no se expone aunque el repositorio lo devuelva.
    Intercambio: {
        autor: (intercambio) => usuariosRepo.buscarPorEmail(intercambio.email),
    },
};