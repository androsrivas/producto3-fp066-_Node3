// src/graphql/resolvers/index.js
// Une los resolvers de cada módulo en un único objeto para Apollo.
import { resolversUsuarios } from "./usuarios.js";

export const resolvers = {
    Query: { ...resolversUsuarios.Query },
    Mutation: { ...resolversUsuarios.Mutation },
};