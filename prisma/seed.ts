// Importamos bcrypt para hashear la contraseña del usuario demo.
// Nunca guardamos contraseñas en texto plano.
import bcrypt from "bcryptjs";

// Importamos la instancia de Prisma ya configurada para nuestro proyecto.
// Esto reutiliza la conexión que armamos en src/lib/prisma.ts.
import { prisma } from "../src/lib/prisma.js";

// Contraseña del usuario demo.
// Esta será la contraseña visible en el README para probar la app localmente.
const DEMO_PASSWORD = "contra123";

// Cantidad de rondas para bcrypt.
// Es la misma idea que usamos en auth.service.ts.
const SALT_ROUNDS = 10;

// Estados internos que usa Prisma/base de datos.
type PrismaLeadStatus = "NEW" | "CONTACTED" | "QUOTED" | "CLOSED" | "LOST";

// Datos base para crear clientes demo.
type DemoClientSeed = {
  key: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  daysAgo: number;
};

// Datos base para crear leads demo.
type DemoLeadSeed = {
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  status: PrismaLeadStatus;
  clientKey?: string;
  daysAgo: number;
};

// Datos base para crear notas demo.
type DemoNoteSeed = {
  leadEmail: string;
  content: string;
  daysAgo: number;
};

// Crea una fecha pasada tomando como referencia el día actual.
// Esto permite que la demo tenga datos distribuidos en distintas fechas.
function dateDaysAgo(days: number, hour = 10, minute = 0): Date {
  const date = new Date();

  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);

  return date;
}

// Borra datos existentes para dejar la demo en un estado limpio.
// El orden importa por las relaciones:
// primero notes, después leads, después clients/users.
async function clearDatabase(): Promise<void> {
  await prisma.note.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
}

// Crea el usuario demo que se usará para iniciar sesión.
async function seedDemoUser() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const createdAt = dateDaysAgo(75, 9, 0);

  return prisma.user.create({
    data: {
      name: "Usuario Demo",
      email: "usuario@test.com",
      password: hashedPassword,
      createdAt,
      updatedAt: createdAt,
    },
  });
}

// Clientes demo.
// Algunos tendrán muchos leads, otros pocos y otros ninguno.
const demoClients: DemoClientSeed[] = [
  {
    key: "estudio-creativo-sur",
    name: "Estudio Creativo Sur",
    email: "contacto@estudiocreativosur.com",
    phone: "+54 11 5555-1234",
    company: "Estudio Creativo Sur",
    daysAgo: 70,
  },
  {
    key: "nexo-digital",
    name: "Nexo Digital",
    email: "hola@nexodigital.com",
    phone: "+54 11 5555-5678",
    company: "Nexo Digital",
    daysAgo: 66,
  },
  {
    key: "tienda-urbana",
    name: "Tienda Urbana",
    email: "contacto@tiendaurbana.com",
    phone: "+54 11 5555-9012",
    company: "Tienda Urbana",
    daysAgo: 61,
  },
  {
    key: "consultora-norte",
    name: "Consultora Norte",
    email: "info@consultoranorte.com",
    phone: "+54 11 5555-3344",
    company: "Consultora Norte",
    daysAgo: 55,
  },
  {
    key: "cafe-central",
    name: "Café Central",
    email: "reservas@cafecentral.com",
    phone: "+54 11 5555-7788",
    company: "Café Central",
    daysAgo: 48,
  },
  {
    key: "academia-futuro",
    name: "Academia Futuro",
    email: "admision@academiafuturo.com",
    phone: "+54 11 5555-2211",
    company: "Academia Futuro",
    daysAgo: 42,
  },
  {
    key: "market-barrio",
    name: "Market Barrio",
    email: "contacto@marketbarrio.com",
    phone: "+54 11 5555-6655",
    company: "Market Barrio",
    daysAgo: 37,
  },
  {
    key: "clinica-del-sol",
    name: "Clínica del Sol",
    email: "turnos@clinicadelsol.com",
    phone: "+54 11 5555-8899",
    company: "Clínica del Sol",
    daysAgo: 31,
  },
  {
    key: "legal-bridge",
    name: "Legal Bridge",
    email: "contacto@legalbridge.com",
    phone: "+54 11 5555-4433",
    company: "Legal Bridge",
    daysAgo: 24,
  },
  {
    key: "sin-leads-demo",
    name: "Pixel Norte",
    email: "hola@pixelnorte.com",
    phone: "+54 11 5555-1010",
    company: "Pixel Norte",
    daysAgo: 12,
  },
];

// Leads demo.
// Mezclamos estados, orígenes, fechas y clientes asociados.
// Algunos no tienen clientKey para que queden sin cliente asociado.
const demoLeads: DemoLeadSeed[] = [
  {
    name: "Ana López",
    email: "ana.lopez@email.com",
    phone: "+54 11 3000-0001",
    message: "Quiero consultar por una landing page para mi emprendimiento.",
    source: "website",
    status: "NEW",
    daysAgo: 1,
  },
  {
    name: "Carlos Gómez",
    email: "carlos.gomez@email.com",
    phone: "+54 11 3000-0002",
    message: "Necesito rediseñar el sitio web de mi empresa.",
    source: "landing-page",
    status: "CONTACTED",
    clientKey: "estudio-creativo-sur",
    daysAgo: 2,
  },
  {
    name: "María Fernández",
    email: "maria.fernandez@email.com",
    phone: "+54 11 3000-0003",
    message: "Estoy buscando mantenimiento mensual para una web existente.",
    source: "referral",
    status: "QUOTED",
    clientKey: "estudio-creativo-sur",
    daysAgo: 3,
  },
  {
    name: "Pedro Álvarez",
    email: "pedro.alvarez@email.com",
    phone: "+54 11 3000-0004",
    message: "Quiero una web institucional para presentar mis servicios.",
    source: "linkedin",
    status: "CLOSED",
    clientKey: "nexo-digital",
    daysAgo: 4,
  },
  {
    name: "Lucía Torres",
    email: "lucia.torres@email.com",
    phone: "+54 11 3000-0005",
    message: "Consulto por una página simple para campaña publicitaria.",
    source: "ads",
    status: "LOST",
    clientKey: "nexo-digital",
    daysAgo: 5,
  },
  {
    name: "Sofía Martínez",
    email: "sofia.martinez@email.com",
    phone: "+54 11 3000-0006",
    message: "Me interesa una web para mostrar productos y recibir consultas.",
    source: "instagram",
    status: "NEW",
    daysAgo: 6,
  },
  {
    name: "Diego Ramírez",
    email: "diego.ramirez@email.com",
    phone: "+54 11 3000-0007",
    message: "Quiero consultar precios para una web con formulario de contacto.",
    source: "website",
    status: "CONTACTED",
    clientKey: "tienda-urbana",
    daysAgo: 7,
  },
  {
    name: "Valentina Ruiz",
    email: "valentina.ruiz@email.com",
    phone: "+54 11 3000-0008",
    message: "Necesito una landing page para captar clientes.",
    source: "landing-page",
    status: "QUOTED",
    daysAgo: 8,
  },
  {
    name: "Nicolás Herrera",
    email: "nicolas.herrera@email.com",
    phone: "+54 11 3000-0009",
    message: "Necesito una web para servicios profesionales.",
    source: "website",
    status: "NEW",
    clientKey: "consultora-norte",
    daysAgo: 10,
  },
  {
    name: "Camila Suárez",
    email: "camila.suarez@email.com",
    phone: "+54 11 3000-0010",
    message: "Quiero saber si hacen sitios con secciones de servicios.",
    source: "instagram",
    status: "CONTACTED",
    clientKey: "consultora-norte",
    daysAgo: 11,
  },
  {
    name: "Federico Molina",
    email: "federico.molina@email.com",
    phone: "+54 11 3000-0011",
    message: "Necesito una landing para una campaña de anuncios.",
    source: "ads",
    status: "LOST",
    daysAgo: 12,
  },
  {
    name: "Julieta Romero",
    email: "julieta.romero@email.com",
    phone: "+54 11 3000-0012",
    message: "Busco una página para mostrar trabajos de diseño.",
    source: "linkedin",
    status: "CLOSED",
    clientKey: "estudio-creativo-sur",
    daysAgo: 14,
  },
  {
    name: "Matías Peralta",
    email: "matias.peralta@email.com",
    phone: "+54 11 3000-0013",
    message: "Quiero una web para un local gastronómico.",
    source: "website",
    status: "QUOTED",
    clientKey: "cafe-central",
    daysAgo: 15,
  },
  {
    name: "Florencia Castro",
    email: "florencia.castro@email.com",
    phone: "+54 11 3000-0014",
    message: "Necesito una página con información de cursos.",
    source: "referral",
    status: "CONTACTED",
    clientKey: "academia-futuro",
    daysAgo: 17,
  },
  {
    name: "Tomás Vega",
    email: "tomas.vega@email.com",
    phone: "+54 11 3000-0015",
    message: "Estoy comparando opciones para crear una web de mi negocio.",
    source: "website",
    status: "NEW",
    daysAgo: 18,
  },
  {
    name: "Martina Silva",
    email: "martina.silva@email.com",
    phone: "+54 11 3000-0016",
    message: "Quiero consultar por una web para turnos y contacto.",
    source: "linkedin",
    status: "NEW",
    clientKey: "clinica-del-sol",
    daysAgo: 20,
  },
  {
    name: "Gonzalo Rivas",
    email: "gonzalo.rivas@email.com",
    phone: "+54 11 3000-0017",
    message: "Necesito actualizar una web vieja y mejorar el formulario.",
    source: "website",
    status: "QUOTED",
    clientKey: "legal-bridge",
    daysAgo: 21,
  },
  {
    name: "Agustina Molina",
    email: "agustina.molina@email.com",
    phone: "+54 11 3000-0018",
    message: "Quiero una landing para presentar una campaña nueva.",
    source: "ads",
    status: "NEW",
    daysAgo: 22,
  },
  {
    name: "Bruno Acosta",
    email: "bruno.acosta@email.com",
    phone: "+54 11 3000-0019",
    message: "Busco presupuesto para una web institucional simple.",
    source: "landing-page",
    status: "CONTACTED",
    clientKey: "market-barrio",
    daysAgo: 24,
  },
  {
    name: "Paula Medina",
    email: "paula.medina@email.com",
    phone: "+54 11 3000-0020",
    message: "Me interesa una web con secciones de productos y contacto.",
    source: "instagram",
    status: "CLOSED",
    clientKey: "tienda-urbana",
    daysAgo: 25,
  },
  {
    name: "Iván Navarro",
    email: "ivan.navarro@email.com",
    phone: "+54 11 3000-0021",
    message: "Quiero cotizar una página para captar consultas.",
    source: "referral",
    status: "NEW",
    daysAgo: 27,
  },
  {
    name: "Carla Mendoza",
    email: "carla.mendoza@email.com",
    phone: "+54 11 3000-0022",
    message: "Necesito una web para mi estudio profesional.",
    source: "website",
    status: "CONTACTED",
    clientKey: "legal-bridge",
    daysAgo: 29,
  },
  {
    name: "Leandro Quiroga",
    email: "leandro.quiroga@email.com",
    phone: "+54 11 3000-0023",
    message: "Quiero mejorar mi sitio actual y agregar formulario.",
    source: "linkedin",
    status: "QUOTED",
    daysAgo: 31,
  },
  {
    name: "Rocío Benítez",
    email: "rocio.benitez@email.com",
    phone: "+54 11 3000-0024",
    message: "Busco una página para promocionar clases online.",
    source: "ads",
    status: "LOST",
    clientKey: "academia-futuro",
    daysAgo: 33,
  },
  {
    name: "Ezequiel Mora",
    email: "ezequiel.mora@email.com",
    phone: "+54 11 3000-0025",
    message: "Necesito una web con información institucional.",
    source: "website",
    status: "NEW",
    daysAgo: 35,
  },
  {
    name: "Antonella Paz",
    email: "antonella.paz@email.com",
    phone: "+54 11 3000-0026",
    message: "Quiero una landing con botón de WhatsApp y formulario.",
    source: "landing-page",
    status: "CONTACTED",
    clientKey: "cafe-central",
    daysAgo: 38,
  },
  {
    name: "Ramiro Castillo",
    email: "ramiro.castillo@email.com",
    phone: "+54 11 3000-0027",
    message: "Estoy buscando una web para un emprendimiento nuevo.",
    source: "instagram",
    status: "NEW",
    daysAgo: 40,
  },
  {
    name: "Milagros Duarte",
    email: "milagros.duarte@email.com",
    phone: "+54 11 3000-0028",
    message: "Necesito una página para explicar servicios y recibir consultas.",
    source: "referral",
    status: "CLOSED",
    clientKey: "consultora-norte",
    daysAgo: 43,
  },
  {
    name: "Santiago Roldán",
    email: "santiago.roldan@email.com",
    phone: "+54 11 3000-0029",
    message: "Quiero consultar por rediseño visual de mi web.",
    source: "website",
    status: "QUOTED",
    clientKey: "nexo-digital",
    daysAgo: 46,
  },
  {
    name: "Daniela Ortiz",
    email: "daniela.ortiz@email.com",
    phone: "+54 11 3000-0030",
    message: "Busco una web sencilla para presentar mi marca.",
    source: "ads",
    status: "NEW",
    daysAgo: 49,
  },
  {
    name: "Franco Cabrera",
    email: "franco.cabrera@email.com",
    phone: "+54 11 3000-0031",
    message: "Me interesa una página institucional con contacto.",
    source: "linkedin",
    status: "CONTACTED",
    clientKey: "market-barrio",
    daysAgo: 52,
  },
  {
    name: "Malena Soto",
    email: "malena.soto@email.com",
    phone: "+54 11 3000-0032",
    message: "Quiero cotizar una landing page profesional.",
    source: "landing-page",
    status: "LOST",
    daysAgo: 55,
  },
  {
    name: "Joaquín Ferrer",
    email: "joaquin.ferrer@email.com",
    phone: "+54 11 3000-0033",
    message: "Necesito una web para mostrar servicios y casos de éxito.",
    source: "website",
    status: "CLOSED",
    clientKey: "clinica-del-sol",
    daysAgo: 58,
  },
  {
    name: "Belén Ponce",
    email: "belen.ponce@email.com",
    phone: "+54 11 3000-0034",
    message: "Estoy interesada en una web con formulario de consultas.",
    source: "instagram",
    status: "NEW",
    daysAgo: 61,
  },
  {
    name: "Emiliano Núñez",
    email: "emiliano.nunez@email.com",
    phone: "+54 11 3000-0035",
    message: "Quiero una página para explicar mi propuesta comercial.",
    source: "referral",
    status: "QUOTED",
    clientKey: "legal-bridge",
    daysAgo: 64,
  },
  {
    name: "Victoria Salas",
    email: "victoria.salas@email.com",
    phone: "+54 11 3000-0036",
    message: "Necesito una página rápida para una campaña puntual.",
    source: "ads",
    status: "NEW",
    daysAgo: 67,
  },
];

// Notas demo asociadas a algunos leads.
const demoNotes: DemoNoteSeed[] = [
  {
    leadEmail: "carlos.gomez@email.com",
    content: "Se contactó al lead y pidió ejemplos de trabajos anteriores.",
    daysAgo: 1,
  },
  {
    leadEmail: "maria.fernandez@email.com",
    content: "Se envió presupuesto inicial de mantenimiento mensual.",
    daysAgo: 2,
  },
  {
    leadEmail: "pedro.alvarez@email.com",
    content: "Lead cerrado correctamente. Quedó interesado en mantenimiento futuro.",
    daysAgo: 3,
  },
  {
    leadEmail: "lucia.torres@email.com",
    content: "El lead no avanzó por presupuesto fuera de rango.",
    daysAgo: 4,
  },
  {
    leadEmail: "diego.ramirez@email.com",
    content: "Pidió una segunda llamada para revisar alcance del proyecto.",
    daysAgo: 6,
  },
  {
    leadEmail: "julieta.romero@email.com",
    content: "Se cerró el proyecto de sitio portfolio.",
    daysAgo: 13,
  },
  {
    leadEmail: "matias.peralta@email.com",
    content: "Se envió propuesta con secciones de menú, ubicación y contacto.",
    daysAgo: 14,
  },
  {
    leadEmail: "florencia.castro@email.com",
    content: "Interesada en página de cursos con formulario.",
    daysAgo: 16,
  },
  {
    leadEmail: "gonzalo.rivas@email.com",
    content: "Requiere mejorar diseño y claridad del formulario actual.",
    daysAgo: 20,
  },
  {
    leadEmail: "bruno.acosta@email.com",
    content: "Se respondió consulta inicial por email.",
    daysAgo: 23,
  },
  {
    leadEmail: "paula.medina@email.com",
    content: "Proyecto cerrado. Quiere comenzar con una primera versión simple.",
    daysAgo: 24,
  },
  {
    leadEmail: "rocio.benitez@email.com",
    content: "No avanzó por falta de presupuesto este mes.",
    daysAgo: 32,
  },
  {
    leadEmail: "antonella.paz@email.com",
    content: "Solicitó incluir botón de WhatsApp visible en mobile.",
    daysAgo: 37,
  },
  {
    leadEmail: "milagros.duarte@email.com",
    content: "Lead cerrado luego de aprobar propuesta institucional.",
    daysAgo: 42,
  },
  {
    leadEmail: "santiago.roldan@email.com",
    content: "Se mandó presupuesto para rediseño visual.",
    daysAgo: 45,
  },
  {
    leadEmail: "franco.cabrera@email.com",
    content: "Falta confirmar contenido final para avanzar.",
    daysAgo: 51,
  },
  {
    leadEmail: "malena.soto@email.com",
    content: "El lead decidió no avanzar por ahora.",
    daysAgo: 54,
  },
  {
    leadEmail: "joaquin.ferrer@email.com",
    content: "Proyecto cerrado para web institucional.",
    daysAgo: 57,
  },
];

// Crea clientes y devuelve un mapa para poder relacionarlos luego.
async function seedClients(): Promise<Map<string, number>> {
  const clientIdsByKey = new Map<string, number>();

  for (const client of demoClients) {
    const createdAt = dateDaysAgo(client.daysAgo, 9, 30);

    const createdClient = await prisma.client.create({
      data: {
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        createdAt,
        updatedAt: createdAt,
      },
    });

    clientIdsByKey.set(client.key, createdClient.id);
  }

  return clientIdsByKey;
}

// Crea leads y devuelve un mapa por email para crear notas después.
async function seedLeads(clientIdsByKey: Map<string, number>): Promise<Map<string, number>> {
  const leadIdsByEmail = new Map<string, number>();

  for (let index = 0; index < demoLeads.length; index++) {
    const lead = demoLeads[index];
    const createdAt = dateDaysAgo(lead.daysAgo, 10 + (index % 7), (index * 7) % 60);

    const clientId = lead.clientKey
      ? clientIdsByKey.get(lead.clientKey)
      : undefined;

    const createdLead = await prisma.lead.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        source: lead.source,
        status: lead.status,
        createdAt,
        updatedAt: createdAt,
        ...(clientId ? { clientId } : {}),
      },
    });

    leadIdsByEmail.set(lead.email, createdLead.id);
  }

  return leadIdsByEmail;
}

// Crea notas internas para algunos leads.
async function seedNotes(userId: number, leadIdsByEmail: Map<string, number>): Promise<void> {
  for (let index = 0; index < demoNotes.length; index++) {
    const note = demoNotes[index];
    const leadId = leadIdsByEmail.get(note.leadEmail);

    if (!leadId) {
      continue;
    }

    const createdAt = dateDaysAgo(note.daysAgo, 15 + (index % 5), (index * 9) % 60);

    await prisma.note.create({
      data: {
        content: note.content,
        leadId,
        userId,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }
}

// Función principal del seed.
// Limpia la base y vuelve a cargar datos demo.
async function main(): Promise<void> {
  console.log("Limpiando base de datos demo...");
  await clearDatabase();

  console.log("Creando usuario demo...");
  const demoUser = await seedDemoUser();

  console.log("Creando clientes demo...");
  const clientIdsByKey = await seedClients();

  console.log("Creando leads demo...");
  const leadIdsByEmail = await seedLeads(clientIdsByKey);

  console.log("Creando notas demo...");
  await seedNotes(demoUser.id, leadIdsByEmail);

  console.log("Seed completado correctamente.");
  console.log(`Clientes creados: ${demoClients.length}`);
  console.log(`Leads creados: ${demoLeads.length}`);
  console.log(`Notas creadas: ${demoNotes.length}`);
  console.log("Usuario demo: usuario@test.com");
  console.log("Contraseña demo: contra123");
}

// Ejecutamos el seed y cerramos la conexión con Prisma al finalizar.
main()
  .catch((error) => {
    console.error("Error ejecutando seed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });