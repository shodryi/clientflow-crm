# ClientFlow — Mini CRM para gestión de leads

ClientFlow es una aplicación **full-stack** tipo mini CRM creada para recibir, organizar y administrar leads provenientes de formularios web, landing pages o campañas digitales.

El proyecto fue desarrollado como aplicación de portfolio para demostrar conocimientos prácticos en **Node.js**, **Express**, **TypeScript**, **Prisma**, **SQLite**, **JWT**, **Zod**, **React**, **Vite** y consumo de APIs desde un frontend moderno.

> Estado actual: proyecto funcional en entorno local.  
> Próximo objetivo: migrar la base de datos de SQLite a PostgreSQL, agregar datos demo con reset diario y preparar deploy público.

---

## Tabla de contenidos

- [Descripción del proyecto](#descripción-del-proyecto)
- [Qué problema resuelve](#qué-problema-resuelve)
- [Funcionalidades principales](#funcionalidades-principales)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Arquitectura general](#arquitectura-general)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Modelo de datos](#modelo-de-datos)
- [Endpoints principales](#endpoints-principales)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Cómo ejecutar el backend](#cómo-ejecutar-el-backend)
- [Cómo ejecutar el frontend](#cómo-ejecutar-el-frontend)
- [Usuario demo local](#usuario-demo-local)
- [Scripts disponibles](#scripts-disponibles)
- [Validaciones y manejo de errores](#validaciones-y-manejo-de-errores)
- [Seguridad](#seguridad)
- [Capturas sugeridas](#capturas-sugeridas)
- [Próximos pasos](#próximos-pasos)
- [Autor](#autor)

---

## Descripción del proyecto

ClientFlow simula una plataforma CRM sencilla donde una empresa puede recibir consultas desde un formulario público y gestionarlas desde un panel privado.

El flujo principal de la aplicación es:

```txt
Formulario público → API → Base de datos → Panel privado → Gestión comercial
```

Desde el panel interno se pueden ver leads, filtrarlos, cambiar su estado, asociarlos a clientes, agregar notas internas y revisar métricas generales en un dashboard.

La aplicación no fue pensada como producto comercial final, sino como un proyecto completo para demostrar habilidades full-stack en un caso de uso realista.

---

## Qué problema resuelve

Muchas empresas reciben consultas desde distintos canales, como sitios web, formularios, campañas o redes sociales. Si esas consultas quedan dispersas, es difícil darles seguimiento.

ClientFlow centraliza esa información en un flujo simple:

- Una persona completa un formulario público.
- La consulta se guarda como lead.
- Un usuario interno inicia sesión en el panel.
- El lead se puede clasificar por estado.
- El lead se puede asociar a un cliente.
- Se pueden agregar notas internas.
- El dashboard muestra estadísticas generales.

---

## Funcionalidades principales

### Autenticación

- Registro de usuario.
- Login con email y contraseña.
- Contraseñas hasheadas con bcryptjs.
- Autenticación con JWT.
- Rutas privadas protegidas con middleware.
- Persistencia de sesión en el frontend usando almacenamiento local.

### Leads

- Crear leads desde formulario público.
- Listar leads desde el panel privado.
- Buscar leads por nombre, email, mensaje u origen.
- Filtrar leads por estado.
- Filtrar leads por cliente asociado.
- Ordenar leads por fecha, nombre, email o estado.
- Paginación.
- Ver detalle de un lead.
- Cambiar estado de un lead.
- Asociar o desasociar un lead con un cliente.
- Borrar leads.

### Estados de leads

Los estados internos de la API son:

```txt
new
contacted
quoted
closed
lost
```

En el frontend se muestran en español como:

```txt
Nuevo
Contactado
Presupuestado
Cerrado
Perdido
```

### Clientes

- Crear clientes.
- Listar clientes.
- Ver detalle de un cliente.
- Editar datos de un cliente.
- Borrar clientes.
- Ver leads asociados a un cliente.

### Notas internas

- Crear notas internas en un lead.
- Listar notas asociadas a un lead.
- Borrar notas.
- Asociar notas al usuario autenticado.

### Dashboard

- Total de leads.
- Total de clientes.
- Total de notas.
- Leads creados hoy.
- Leads creados este mes.
- Leads por estado.
- Leads por origen.
- Leads recientes.
- Tasa de conversión.
- Tasa de pérdida.

### Frontend

- Login.
- Dashboard.
- Página de leads.
- Página de detalle de lead.
- Página de clientes.
- Página de detalle de cliente.
- Formulario público.
- Diseño responsive.
- Interfaz conectada completamente al backend.

---

## Tecnologías utilizadas

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- SQLite
- Zod
- JWT con jose
- bcryptjs
- dotenv
- CORS

### Frontend

- React
- Vite
- TypeScript
- React Router
- CSS responsive
- Fetch API
- Context API para autenticación

### Herramientas

- npm
- Prisma Studio
- PowerShell para pruebas manuales
- Git / GitHub

---

## Arquitectura general

El proyecto está organizado como una aplicación full-stack en una misma carpeta raíz:

```txt
clientflow-api/
  src/        → Backend
  prisma/     → Schema y migraciones de base de datos
  web/        → Frontend React + Vite
```

El backend expone una API REST y el frontend consume esa API usando una variable de entorno:

```env
VITE_API_URL=http://localhost:3000
```

En desarrollo local:

```txt
Backend:  http://localhost:3000
Frontend: http://localhost:5173
```

---

## Estructura del proyecto

```txt
clientflow-api/
  prisma/
    migrations/
    schema.prisma

  src/
    constants/
      lead-statuses.ts

    controllers/
      auth.controller.ts
      client.controller.ts
      dashboard.controller.ts
      lead.controller.ts
      note.controller.ts

    generated/
      prisma/

    lib/
      jwt.ts
      prisma.ts

    middlewares/
      auth.middleware.ts
      error.middleware.ts
      not-found.middleware.ts
      validate.ts

    routes/
      auth.routes.ts
      client.routes.ts
      dashboard.routes.ts
      lead.routes.ts
      note.routes.ts

    schemas/
      auth.schema.ts
      client.schema.ts
      lead.schema.ts
      note.schema.ts

    services/
      auth.service.ts
      client.service.ts
      dashboard.service.ts
      lead.service.ts
      note.service.ts

    types/
      auth.ts
      client.ts
      lead.ts
      note.ts

    app.ts
    server.ts

  web/
    src/
      components/
      context/
      lib/
      pages/
      types/
      App.tsx
      main.tsx
      styles.css

    index.html
    package.json
    .env.example

  .env.example
  .gitignore
  package.json
  prisma.config.ts
  tsconfig.json
```

---

## Modelo de datos

El sistema trabaja con cuatro entidades principales:

### User

Representa un usuario administrador del CRM.

Campos principales:

- id
- name
- email
- password
- createdAt
- updatedAt

### Lead

Representa una consulta o contacto recibido desde un formulario público.

Campos principales:

- id
- name
- email
- phone
- message
- source
- status
- clientId
- createdAt
- updatedAt

### Client

Representa un cliente o empresa asociada a uno o más leads.

Campos principales:

- id
- name
- email
- phone
- company
- createdAt
- updatedAt

### Note

Representa una nota interna asociada a un lead.

Campos principales:

- id
- content
- leadId
- userId
- createdAt
- updatedAt

---

## Endpoints principales

### Health check

```http
GET /health
```

Verifica si la API está funcionando.

---

### Auth

```http
POST /auth/register
POST /auth/login
GET /auth/me
```

`GET /auth/me` requiere token JWT.

---

### Leads

```http
GET /leads
POST /leads/public
GET /leads/:id
PATCH /leads/:id/status
PATCH /leads/:id/client
DELETE /leads/:id
```

La mayoría de rutas de leads son privadas, excepto:

```http
POST /leads/public
```

Ejemplos de filtros:

```http
GET /leads?page=1&limit=5
GET /leads?status=contacted
GET /leads?search=landing
GET /leads?clientId=1
GET /leads?sortBy=name&sortOrder=asc
```

---

### Clientes

```http
GET /clients
POST /clients
GET /clients/:id
PUT /clients/:id
DELETE /clients/:id
```

Todas las rutas de clientes requieren autenticación.

---

### Notas

```http
GET /leads/:id/notes
POST /leads/:id/notes
DELETE /notes/:id
```

Todas las rutas de notas requieren autenticación.

---

### Dashboard

```http
GET /dashboard/stats
```

Devuelve métricas generales del CRM. Requiere autenticación.

---

## Instalación local

### Requisitos

Antes de empezar, necesitás tener instalado:

- Node.js
- npm
- Git

Cloná el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd clientflow-api
```

---

## Variables de entorno

### Backend

Creá un archivo `.env` en la raíz del proyecto usando como referencia `.env.example`:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-secret-key-before-production-123456"
```

El valor de `JWT_SECRET` debe tener al menos 32 caracteres.

### Frontend

Creá un archivo `.env` dentro de `web/` usando como referencia `web/.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

---

## Cómo ejecutar el backend

Desde la raíz del proyecto:

```bash
npm install
```

Aplicá las migraciones de Prisma:

```bash
npx prisma migrate dev
```

Generá Prisma Client si fuera necesario:

```bash
npx prisma generate
```

Levantá el servidor:

```bash
npm run dev
```

La API debería quedar disponible en:

```txt
http://localhost:3000
```

Probá el health check:

```txt
http://localhost:3000/health
```

---

## Cómo ejecutar el frontend

En otra terminal:

```bash
cd web
npm install
npm run dev
```

El frontend debería quedar disponible en:

```txt
http://localhost:5173
```

---

## Usuario demo local

Como la base de datos local no se sube al repositorio, después de ejecutar las migraciones necesitás crear un usuario.

Podés hacerlo desde el frontend en caso de tener una pantalla de registro, o desde PowerShell con la API:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/auth/register" `
  -ContentType "application/json" `
  -Body '{"name":"Usuario Demo","email":"usuario@test.com","password":"contra123"}'
```

Luego podés iniciar sesión con:

```txt
usuario@test.com
contra123
```

---

## Scripts disponibles

### Backend

Desde la raíz del proyecto:

```bash
npm run dev
```

Levanta el backend en modo desarrollo.

```bash
npm run build
```

Compila TypeScript a JavaScript en `dist/`.

```bash
npm run start
```

Ejecuta la versión compilada.

### Frontend

Desde la carpeta `web/`:

```bash
npm run dev
```

Levanta Vite en modo desarrollo.

```bash
npm run build
```

Genera la build de producción del frontend.

```bash
npm run preview
```

Previsualiza la build de producción localmente.

---

## Validaciones y manejo de errores

El backend usa Zod para validar:

- body
- params
- query params

Ejemplos de validaciones:

- Email válido.
- Campos obligatorios.
- IDs positivos.
- Estados permitidos.
- Límites de longitud.
- Paginación válida.
- Ordenamiento permitido.

El frontend muestra errores en español y detecta casos como:

- API apagada.
- Login incorrecto.
- Token inválido o expirado.
- Validaciones fallidas.
- Recursos no encontrados.

---

## Seguridad

El proyecto incluye las siguientes medidas de seguridad:

- Contraseñas hasheadas con bcryptjs.
- JWT para rutas privadas.
- Middleware de autenticación.
- Variables sensibles fuera del repositorio.
- `.env.example` para documentar configuración.
- Validaciones centralizadas con Zod.
- Manejo controlado de errores.
- Separación entre rutas públicas y privadas.

---

## Capturas sugeridas

Cuando el proyecto esté subido a GitHub, se recomienda agregar capturas en una carpeta:

```txt
docs/screenshots/
```

Capturas sugeridas:

```txt
docs/screenshots/login.png
docs/screenshots/dashboard.png
docs/screenshots/leads.png
docs/screenshots/lead-detail.png
docs/screenshots/clients.png
docs/screenshots/client-detail.png
docs/screenshots/public-form.png
```

Y luego agregarlas al README:

```md
![Dashboard](docs/screenshots/dashboard.png)
![Leads](docs/screenshots/leads.png)
![Formulario público](docs/screenshots/public-form.png)
```

---

## Próximos pasos

El proyecto ya funciona localmente. Los próximos pasos planificados son:

- Migrar SQLite a PostgreSQL.
- Crear datos demo con seed.
- Crear reset automático diario de la base demo.
- Preparar deploy del backend.
- Preparar deploy del frontend.
- Agregar URL pública al README.
- Agregar capturas reales del proyecto.
- Mejorar documentación de endpoints.

---

## Objetivo de portfolio

Este proyecto demuestra:

- Desarrollo backend con Node.js, Express y TypeScript.
- Diseño de API REST.
- Validaciones con Zod.
- Autenticación con JWT.
- Hash de contraseñas.
- Uso de ORM con Prisma.
- Modelado de datos relacionales.
- Migraciones de base de datos.
- Manejo de errores centralizado.
- Frontend con React, Vite y TypeScript.
- Consumo de API desde frontend.
- Rutas protegidas.
- Formularios controlados.
- Estado global de autenticación.
- Diseño responsive.
- Organización de proyecto full-stack.

---

## Autor

Desarrollado por **Rodrigo Sanchez**.

Proyecto creado como parte de portfolio personal para demostrar habilidades full-stack orientadas a desarrollo web, APIs, bases de datos, autenticación y frontend moderno.
