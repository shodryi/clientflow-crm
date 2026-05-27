// Importamos Express para crear la aplicación del servidor.
import express from "express";

// Importamos CORS para permitir requests desde otros orígenes.
// Más adelante será útil si conectamos un frontend en React/Next.js.
import cors from "cors";

// Importamos las rutas de auth.
import authRouter from "./routes/auth.routes.js";

// Importamos las rutas de clients.
import clientRouter from "./routes/client.routes.js";

// Importamos las rutas de dashboard.
import dashboardRouter from "./routes/dashboard.routes.js";

// Importamos las rutas de leads.
import leadRouter from "./routes/lead.routes.js";

// Importamos las rutas de notes.
import noteRouter from "./routes/note.routes.js";

// Importamos middleware para rutas no encontradas.
import { notFoundHandler } from "./middlewares/not-found.middleware.js";

// Importamos middleware global de errores.
import { errorHandler } from "./middlewares/error.middleware.js";

// Creamos la app principal de Express.
const app = express();

// Middleware de CORS.
// Permite que otros clientes puedan consumir nuestra API.
app.use(cors());

// Middleware para que Express pueda leer JSON en el body.
// Sin esto, req.body vendría undefined en requests POST/PATCH con JSON.
app.use(express.json());

// Ruta simple para verificar que la API está funcionando.
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ClientFlow API is running",
  });
});

// Conectamos rutas de autenticación bajo /auth.
app.use("/auth", authRouter);

// Conectamos rutas de dashboard bajo /dashboard.
app.use("/dashboard", dashboardRouter);

// Conectamos rutas de clientes bajo /clients.
app.use("/clients", clientRouter);

// Conectamos todas las rutas de leads bajo el prefijo /leads.
app.use("/leads", leadRouter);

// Conectamos rutas de notas bajo /notes.
app.use("/notes", noteRouter);

// Si ninguna ruta anterior respondió, devolvemos 404 en JSON.
app.use(notFoundHandler);

// Middleware global de errores.
// Debe ir al final de todo.
app.use(errorHandler);

// Exportamos app para usarla en server.ts.
// También nos va a servir más adelante para tests.
export default app;