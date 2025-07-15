import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from './config/database.js';
import './models/associations.js'; // Import associations to set up model relationships
import routes from './routes/index.js';
import requestLogger from './middleware/requestLogger.js';
import cacheControl from './middleware/cacheControl.js';
import corsOptions from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import ImageCacheMiddleware from './middleware/imageCache.js';
import webpRedirect from './middleware/webpRedirect.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Inicializar middleware de caché de imágenes
const imageCache = new ImageCacheMiddleware();

// Aplica middlewares globales
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// Middleware para redirección a WebP (debe ir ANTES del static)
app.use('/images/cards/normal', webpRedirect);
app.use('/images/cards/small', webpRedirect);
app.use('/images/cards/cropped', webpRedirect);

// Middleware para servir archivos estáticos (con caché optimizado para imágenes)
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  maxAge: '1y', // Cache por 1 año
  etag: true,
  lastModified: true,
  immutable: true
}));

// Servir archivos estáticos generales desde public
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h', // Cache por 1 hora para archivos estáticos generales
  etag: true,
  lastModified: true
}));

// Middleware de caché inteligente para imágenes (descargar si no existen)
app.use(imageCache.middleware());

// Middlewares adicionales para gestión de imágenes
app.use(imageCache.cleanupMiddleware());
app.use(imageCache.statsMiddleware());

app.use(cacheControl(3600)); // Cache por 1 hora para otras rutas

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando correctamente!');
});

// Aplica las rutas
app.use('/api', routes);

// Manejo de rutas no encontradas y errores
app.use(notFoundHandler);
app.use(errorHandler);

// Conectar con la base de datos y levantar el servidor
authenticate()
  .then(() => {
    // El mensaje ya se muestra en la función authenticate
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Servidor iniciado en el puerto ${process.env.PORT || 3000}`);
    });
  })
  .catch(err => {
    console.error('No se pudo conectar con la base de datos:', err);
  });


