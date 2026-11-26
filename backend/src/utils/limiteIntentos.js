// src/utils/limiteIntentos.js
// Limitador de intentos fallidos en memoria (por clave, p. ej. el email de un login).
// Frena los ataques de fuerza bruta. Al reiniciar el servidor se pierde el contador,
// algo aceptable en este proyecto (una sola instancia, sin Redis).

/**
 * Crea un limitador de intentos fallidos.
 * @param {{ max: number, ventanaMs: number, ahora?: () => number }} opciones
 *   max: fallos permitidos dentro de la ventana; ventanaMs: duración del bloqueo/ventana;
 *   ahora: reloj (inyectable para tests).
 * @returns {{ segundosRestantes: (clave: string) => number, registrarFallo: (clave: string) => void, reiniciar: (clave: string) => void }}
 */
export function crearLimitador({ max, ventanaMs, ahora = Date.now }) {
    /** @type {Map<string, { fallos: number, caduca: number }>} */
    const registros = new Map();

    /** Elimina los registros caducados para que el mapa no crezca sin límite */
    function limpiar() {
        const t = ahora();
        for (const [clave, r] of registros) {
            if (r.caduca <= t) registros.delete(clave);
        }
    }

    return {
        /**
         * @param {string} clave
         * @returns {number} Segundos que faltan para poder reintentar (0 si no está bloqueada).
         */
        segundosRestantes(clave) {
            const r = registros.get(clave);
            if (!r) return 0;
            const t = ahora();
            if (r.caduca <= t) {
                registros.delete(clave);
                return 0;
            }
            return r.fallos >= max ? Math.ceil((r.caduca - t) / 1000) : 0;
        },

        /** Anota un intento fallido (la ventana empieza en el primer fallo) */
        registrarFallo(clave) {
            limpiar();
            const t = ahora();
            const r = registros.get(clave);
            if (r) r.fallos += 1;
            else registros.set(clave, { fallos: 1, caduca: t + ventanaMs });
        },

        /** Borra los fallos de una clave (tras un acierto) */
        reiniciar(clave) {
            registros.delete(clave);
        },
    };
}
