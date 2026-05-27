# ClientFlow — Mini CRM para gestión de leads

ClientFlow es una aplicación full-stack tipo mini CRM creada para recibir, organizar y administrar leads provenientes de sitios web, landing pages, campañas digitales o integraciones externas.

El proyecto fue desarrollado como aplicación de portfolio para demostrar conocimientos prácticos en backend, frontend, autenticación, bases de datos relacionales, deploy, automatización y consumo de APIs desde una interfaz moderna.

## Demo pública

- **Frontend:** https://clientflow-crm-roan.vercel.app
- **Backend API:** https://clientflow-api-n9gh.onrender.com
- **Health check:** https://clientflow-api-n9gh.onrender.com/health

> Nota: el backend está desplegado en Render Free. Si la API estuvo inactiva durante un tiempo, puede tardar algunos segundos en responder en el primer acceso.

## Usuario demo

```txt
Email: usuario@test.com
Password: contra123
```

## Estado actual

Proyecto funcional y desplegado.

Actualmente incluye:

- Backend deployado en Render.
- Frontend deployado en Vercel.
- Base de datos PostgreSQL en Neon.
- Seed demo con datos ficticios.
- Reset automático de la base demo cada 4 días usando GitHub Actions.
- Interfaz responsive conectada al backend.
- README preparado para portfolio, uso local y deploy.

## Tabla de contenidos

- [Descripción del proyecto](#descripción-del-proyecto)
- [Qué problema resuelve](#qué-problema-resuelve)
- [Funcionalidades principales](#funcionalidades-principales)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Arquitectura general](#arquitectura-general)
- [Modelo de datos](#modelo-de-datos)
- [Endpoints principales](#endpoints-principales)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Seed de datos demo](#seed-de-datos-demo)
- [Reset automático de la demo](#reset-automático-de-la-demo)
- [Scripts disponibles](#scripts-disponibles)
- [Validaciones-y-manejo-de-errores](#validaciones-y-manejo-de-errores)
- [Seguridad](#seguridad)
- [Objetivo de portfolio](#objetivo-de-portfolio)
- [Autor](#autor)

## Descripción del proyecto

ClientFlow simula una plataforma CRM sencilla donde una empresa puede recibir consultas comerciales y gestionarlas desde un panel privado.

El flujo principal de la aplicación es:

```txt
Formulario web, landing page, campaña o integración externa
        ↓
API REST
        ↓
Base de datos PostgreSQL
        ↓
Panel privado
        ↓
Gestión comercial del lead
```

En esta demo, el formulario público sirve para simular la recepción de leads desde distintos canales como sitio web, landing pages, anuncios, Instagram o referidos. Para facilitar la prueba del proyecto, el origen del lead puede seleccionarse manualmente desde el formulario.

Desde el panel interno se pueden ver leads, filtrarlos, cambiar su estado, asociarlos a clientes, agregar notas internas y revisar métricas generales en un dashboard.

La aplicación no fue pensada como producto comercial final, sino como un proyecto completo para demostrar habilidades full-stack en un caso de uso realista.

## Qué problema resuelve

Muchas empresas reciben consultas desde distintos canales: sitios web, formularios, campañas, redes sociales o referidos. Si esas consultas quedan dispersas, es difícil darles seguimiento.

ClientFlow centraliza esa información en un flujo simple:

1. La empresa recibe un lead desde un formulario web, landing page, campaña publicitaria o integración externa.
2. La consulta se guarda como lead.
3. Un usuario interno inicia sesión en el panel.
4. El lead se puede clasificar por estado.
5. El lead se puede asociar a un cliente.
6. Se pueden agregar notas internas.
7. El dashboard muestra estadísticas generales.

## Funcionalidades principales

### Autenticación

- Registro de usuario mediante API.
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
- Detección visual de conexión con la API.
- Mensajes de error en español.
- Interfaz conectada completamente al backend.

## Tecnologías utilizadas

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Neon
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

### Deploy y herramientas

- Render para backend.
- Vercel para frontend.
- Neon para PostgreSQL.
- GitHub Actions para reset automático de datos demo.
- Git / GitHub.
- npm.
- PowerShell para pruebas manuales.

## Arquitectura general

El proyecto está organizado como una aplicación full-stack en un mismo repositorio.

```txt
clientflow-crm/
  src/                 Backend Express + TypeScript
  prisma/              Schema, migraciones y seed de datos demo
  web/                 Frontend React + Vite
  .github/workflows/   Automatización para reset de datos demo
```

En desarrollo local:

```txt
Frontend React + Vite
        ↓
http://localhost:3000
        ↓
Backend Express + TypeScript
        ↓
PostgreSQL
```

En producción:

```txt
Frontend en Vercel
        ↓
Backend en Render
        ↓
PostgreSQL en Neon
```

## Modelo de datos

El sistema trabaja con cuatro entidades principales.

### User

Representa un usuario administrador del CRM.

Campos principales:

```txt
id
name
email
password
createdAt
updatedAt
```

### Lead

Representa una consulta o contacto recibido desde un formulario, campaña o integración externa.

Campos principales:

```txt
id
name
email
phone
message
source
status
clientId
createdAt
updatedAt
```

### Client

Representa un cliente o empresa asociada a uno o más leads.

Campos principales:

```txt
id
name
email
phone
company
createdAt
updatedAt
```

### Note

Representa una nota interna asociada a un lead.

Campos principales:

```txt
id
content
leadId
userId
createdAt
updatedAt
```

## Endpoints principales

### Health check

```txt
GET /health
```

Verifica si la API está funcionando.

### Auth

```txt
POST /auth/register
POST /auth/login
GET /auth/me
```

`GET /auth/me` requiere token JWT.

### Leads

```txt
GET /leads
POST /leads/public
GET /leads/:id
PATCH /leads/:id/status
PATCH /leads/:id/client
DELETE /leads/:id
```

La mayoría de rutas de leads son privadas, excepto:

```txt
POST /leads/public
```

Ejemplos de filtros:

```txt
GET /leads?page=1&limit=5
GET /leads?status=contacted
GET /leads?search=landing
GET /leads?clientId=1
GET /leads?sortBy=name&sortOrder=asc
```

### Clientes

```txt
GET /clients
POST /clients
GET /clients/:id
PUT /clients/:id
DELETE /clients/:id
```

Todas las rutas de clientes requieren autenticación.

### Notas

```txt
GET /leads/:id/notes
POST /leads/:id/notes
DELETE /notes/:id
```

Todas las rutas de notas requieren autenticación.

### Dashboard

```txt
GET /dashboard/stats
```

Devuelve métricas generales del CRM. Requiere autenticación.

## Instalación local

### Requisitos

Antes de empezar, necesitás tener instalado:

- Node.js.
- npm.
- Git.
- Una base PostgreSQL.
- Opcional: cuenta en Neon para usar PostgreSQL en la nube.

Cloná el repositorio:

```bash
git clone https://github.com/shodryi/clientflow-crm
cd clientflow-crm
```

Instalá dependencias del backend:

```bash
npm install
```

Instalá dependencias del frontend:

```bash
cd web
npm install
cd ..
```

## Variables de entorno

### Backend

Creá un archivo `.env` en la raíz del proyecto usando como referencia `.env.example`:

```env
PORT=3000

DATABASE_URL="postgresql://PASSWORD@HOST-POOLER.neon.tech/DATABASE?sslmode=require"

DIRECT_DATABASE_URL="postgresql://PASSWORD@HOST.neon.tech/DATABASE?sslmode=require"

JWT_SECRET="change-this-secret-key-with-at-least-32-characters"
```

Notas:

- `DATABASE_URL` se usa para la conexión principal de la aplicación.
- `DIRECT_DATABASE_URL` se usa para operaciones directas como migraciones o tareas de mantenimiento.
- `JWT_SECRET` debe tener al menos 32 caracteres.

### Frontend

Creá un archivo `.env` dentro de `web/` usando como referencia `web/.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

Para producción en Vercel, esta variable apunta al backend deployado:

```env
VITE_API_URL=https://clientflow-api-n9gh.onrender.com
```

## Cómo ejecutar el backend

Desde la raíz del proyecto:

```bash
npx prisma generate
```

Aplicá migraciones en una base de desarrollo:

```bash
npx prisma migrate dev
```

Cargá datos demo:

```bash
npx prisma db seed
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

## Cómo ejecutar el frontend

En otra terminal:

```bash
cd web
npm run dev
```

El frontend debería quedar disponible en:

```txt
http://localhost:5173
```

## Seed de datos demo

El proyecto incluye un archivo de seed en:

```txt
prisma/seed.ts
```

Este seed crea datos ficticios para probar la aplicación:

- Usuario demo.
- Clientes.
- Leads.
- Notas.
- Relaciones entre leads y clientes.
- Fechas distribuidas para que el dashboard se vea más realista.

Ejecutá la seed con:

```bash
npx prisma db seed
```

Luego podés iniciar sesión con:

```txt
Email: usuario@test.com
Password: contra123
```

## Reset automático de la demo

La demo pública usa una base de datos PostgreSQL en Neon.

Este proyecto incluye un workflow de GitHub Actions que resetea los datos demo automáticamente cada 4 días.

## Scripts disponibles

### Backend

Desde la raíz del proyecto:

```bash
npm run dev
```

Compila TypeScript a JavaScript en `dist/`.

```bash
npm run start
```

Ejecuta la versión compilada.

### Prisma

```bash
npx prisma generate
```

Genera Prisma Client.

```bash
npx prisma migrate dev
```

Crea o aplica migraciones en desarrollo.

```bash
npx prisma migrate deploy
```

Aplica migraciones pendientes en producción o deploy.

```bash
npx prisma db seed
```

Ejecutar la seed demo.

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

## Seguridad

El proyecto incluye las siguientes medidas de seguridad:

- Contraseñas hasheadas con bcryptjs.
- JWT para rutas privadas.
- Middleware de autenticación.
- Variables sensibles fuera del repositorio.
- `.env.example` para documentar configuración sin exponer secretos reales.
- Validaciones centralizadas con Zod.
- Manejo controlado de errores.
- Separación entre rutas públicas y privadas.

## Objetivo de portfolio

Este proyecto demuestra:

- Desarrollo backend con Node.js, Express y TypeScript.
- Diseño de API REST.
- Validaciones con Zod.
- Autenticación con JWT.
- Hash de contraseñas.
- Uso de ORM con Prisma.
- Modelado de datos relacionales.
- Uso de PostgreSQL en la nube con Neon.
- Migraciones de base de datos.
- Seed de datos demo.
- Uso de GitHub Actions.
- Manejo de errores centralizado.
- Frontend con React, Vite y TypeScript.
- Consumo de API desde frontend.
- Rutas protegidas.
- Formularios controlados.
- Estado global de autenticación.
- Diseño responsive.
- Deploy de backend en Render.
- Deploy de frontend en Vercel.
- Organización de proyecto full-stack.

## Autor

Desarrollado por **Rodrigo Sanchez**.

Proyecto creado como parte de portfolio personal para demostrar habilidades full-stack orientadas a desarrollo web, APIs, bases de datos, autenticación, deploy y frontend moderno.
