import express from 'express';
import cors from 'cors';
import { authenticate } from './config/database.js';
import routes from './routes/index.js';
import requestLogger from './middleware/requestLogger.js';
import cacheControl from './middleware/cacheControl.js';
import corsOptions from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Aplica middlewares globales
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);
app.use(cacheControl(3600)); // Cache por 1 hora

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


