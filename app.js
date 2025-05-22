import express, { json } from 'express';
import cors from 'cors';
import { authenticate } from './config/database.js';

const app = express();
app.use(cors());
app.use(json());

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

// Importar rutas
import packRoutes from './routes/packRoutes.js';
app.use('/packs', packRoutes);

// Importar modelos
import Pack from './models/pack.js';

// Sincronizar modelos con la base de datos
Pack.sync({ alter: true })
  .then(() => {
    console.log('Modelo Pack sincronizado con la base de datos');
  })
  .catch(err => {
    console.error('Error al sincronizar el modelo Pack:', err);
  });


