// src/graphql/resolvers/index.js
// Une los resolvers de cada módulo en un único objeto para Apollo.
import { resolversUsuarios } from "./usuarios.js";
import { resolversIntercambios } from "./intercambios.js";

export const resolvers = {
    Query: { ...resolversUsuarios.Query, ...resolversIntercambios.Query },
    Mutation: { ...resolversUsuarios.Mutation, ...resolversIntercambios.Mutation },
    Intercambio: resolversIntercambios.Intercambio,
};