
import { resolversUsuarios } from "./usuarios.js";
import { resolversIntercambios } from "./intercambios.js";

export const resolvers = {
    Query: { ...resolversUsuarios.Query, ...resolversIntercambios.Query },
    Mutation: { ...resolversUsuarios.Mutation, ...resolversIntercambios.Mutation },
    Intercambio: resolversIntercambios.Intercambio,
};