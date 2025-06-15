# yugiohdb

Repositorio para la gestión y consulta de cartas, mazos y datos relacionados con Yu-Gi-Oh!

## Descripción

Este proyecto está orientado a la creación de una base de datos estructurada de cartas y elementos del universo Yu-Gi-Oh!, facilitando la importación, transformación y consulta de datos para aplicaciones, análisis o desarrollo de herramientas.

## Estructura del proyecto

- `/controllers/` — Lógica de negocio y controladores de la API.
- `/models/` — Definición de modelos de datos (ORM/ODM).
- `/routes/` — Rutas de la API.
- `/middleware/` — Middlewares para validación, logging, etc.
- `/scripts/` — Scripts de importación, transformación y pruebas para poblar la base de datos.
- `/utils/` — Utilidades y funciones auxiliares.
- `/config/` — Configuración de la base de datos y otros servicios.
- Archivos `.json` en la raíz — Datos de prueba, resultados de importaciones, logs de errores, etc.

## Uso

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Configura la base de datos en `/config/database.js`.
3. Utiliza los scripts de `/scripts/` para importar y transformar datos según sea necesario.
4. Ejecuta la aplicación principal:
   ```bash
   node app.js
   ```

## Notas

- Los archivos JSON en la raíz y muchos scripts son utilidades de pruebas y experimentación para poblar y depurar la base de datos.
- El código está organizado por capas para facilitar el mantenimiento y la escalabilidad.
- Se recomienda limpiar los datos y scripts de pruebas antes de un despliegue en producción.

## Licencia

MIT