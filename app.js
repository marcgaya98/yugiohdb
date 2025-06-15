import express, { json } from 'express';
import cors from 'cors';
import { authenticate } from './config/database.js';
import routes from './routes/index.js';
import requestLogger from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import cacheControl from './middleware/cacheControl.js';
import corsOptions from './middleware/cors.js';

const app = express();

// Aplica middlewares globales
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);
app.use(cacheControl(3600)); // Cache por 1 hora

// Aplica las rutas
app.use('/api', routes);

// Manejo de rutas no encontradas y errores
app.use('*', notFoundHandler);
app.use(errorHandler);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando correctamente!');
});

// Conectar con la base de datos y levantar el servidor
authenticate()
  .then(() => {
    console.log('Conexión con la base de datos establecida');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Servidor iniciado en el puerto ${process.env.PORT || 3000}`);
    });
  })
  .catch(err => {
    console.error('No se pudo conectar con la base de datos:', err);
  });

// Importar rutas(property) Application<Record<string, any>>.get: <"/", {}, any, any, QueryString.ParsedQs, Record<string, any>>(path: "/", ...handlers: RequestHandler<{}, any, any, QueryString.ParsedQs, Record<string, any>>[]) => Express (
import packRoutes from './routes/packRoutes.js';
app.use('/packs', packRoutes);

// Importar modelos
import Pack from './models/pack.js';
import Genre from './models/Genre.js';

// Sincronizar modelos con la base de datos
Pack.sync({ alter: true })
  .then(() => {
    console.log('Modelo Pack sincronizado con la base de datos');
  })
  .catch(err => {
    console.error('Error al sincronizar el modelo Pack:', err);
  });

Genre.sync({ alter: true })
  .then(() => {
    console.log('Modelo Genre sincronizado con la base de datos');
  })
  .catch(err => {
    console.error('Error al sincronizar el modelo Genre:', err);
  });


