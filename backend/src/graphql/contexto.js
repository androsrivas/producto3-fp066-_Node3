// src/graphql/contexto.js
// Construye el contexto de Apollo en cada petición: { usuario } a partir del JWT.
import { verificarToken } from "../services/auth.js";
import * as usuariosRepo from "../repositories/usuarios.js";

/**
 * @param {{ req: import("express").Request }} params
 * @returns {Promise<{ usuario: object|null }>}
 */
export async function crearContexto({ req }) {
    const cabecera = req.headers.authorization ?? "";
    if (!cabecera.startsWith("Bearer ")) {
        return { usuario: null };
    }
    const token = cabecera.slice(7);
    
    const payload = verificarToken(token);
    if (!payload) return { usuario: null };
    
    const usuario = await usuariosRepo.buscarPorId(payload.sub);
    if (!usuario) return { usuario: null };

    const { passwordHash, ...usuarioSinHash } = usuario;
    return { usuario: usuarioSinHash };
}