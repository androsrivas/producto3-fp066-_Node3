// src/data/demo.js
// Datos de ejemplo para poder probar la apliación.
import * as usuariosRepo from "../repositories/usuarios.js";
import * as intercambiosRepo from "../repositories/intercambios.js";
import { hashPassword } from "../services/auth.js";

const USUARIOS_DEMO = [
  { nombre: "Laura Puig", email: "laura@tandem.com", password: "1234" },
  { nombre: "John Smith", email: "john@tandem.com", password: "abcd" },
  { nombre: "Aya Tanaka", email: "aya@tandem.com", password: "5678" },
];

const INTERCAMBIOS_DEMO = [
  {
    titulo: "Conversación en inglés los martes",
    email: "john@tandem.com",
    fecha: "2026-11-03",
    descripcion:
      "Practico inglés una hora por videollamada a cambio de practicar español.",
    tipo: "OFREZCO_IDIOMA",
  },
  {
    titulo: "Busco practicar catalán",
    email: "aya@tandem.com",
    fecha: "2026-11-05",
    descripcion: "Quedada semanal para hablar catalán en un ambiente relajado.",
    tipo: "BUSCO_IDIOMA",
  },
  {
    titulo: "Intercambio español-inglés en la biblioteca",
    email: "laura@tandem.com",
    fecha: "2026-11-07",
    descripcion:
      "Sesiones de 45 minutos. Se necesita un nivel mínimo B1 de inglés.",
    tipo: "OFREZCO_IDIOMA",
  },
  {
    titulo: "Quiero perder el miedo a hablar inglés",
    email: "laura@tandem.com",
    fecha: "2026-11-09",
    descripcion:
      "Busco a alguien paciente para charlar por videollamada dos veces por semana.",
    tipo: "BUSCO_IDIOMA",
  },
];

export async function cargarDatosDemo() {
  try {
    for (const u of USUARIOS_DEMO) {
      const passwordHash = await hashPassword(u.password);
      await usuariosRepo.crear({ nombre: u.nombre, email: u.email, passwordHash });
    }
    console.log("Usuarios cargados", (await usuariosRepo.listar()).length);

    for (const i of INTERCAMBIOS_DEMO) {
        await intercambiosRepo.crear(i);
    }
    console.log("Intercambios cargados", (await intercambiosRepo.listar()).length);
  } catch (error) {
    console.error("No se pudieron cargar los datos de ejemplo", error);
  }
}
