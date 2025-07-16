# YuGiOh DB - Instrucciones generales para Copilot

## Arquitectura del proyecto
Este proyecto es una API REST para una base de datos de Yu-Gi-Oh! usando:
- Node.js con Express
- MySQL con Sequelize ORM
- ES Modules (import/export)
- Docker para desarrollo y producción

## Convenciones de código
- Usar camelCase para variables, funciones y propiedades
- Usar PascalCase para clases y modelos
- Usar ES6+ features (async/await, arrow functions, etc.)
- Incluir comentarios JSDoc en funciones públicas
- Mantener consistencia con el estilo existente (2 espacios de indentación)

## Convenciones de base de datos
- Todos los nombres de tablas y columnas en la base de datos MySQL deben estar en snake_case (minúsculas y con guiones bajos).
- Los modelos y atributos en Sequelize pueden mapearse a camelCase en el código, pero la estructura física en la base de datos debe seguir snake_case.
- Ejemplo: la tabla card, columna card_type, etc.

## Patrones de diseño
- Seguir el patrón MVC (Model-View-Controller)
- Cada entidad tiene su propio controlador, modelo y rutas
- Centralizar asociaciones en models/associations.js
- Usar middleware para funcionalidades transversales (validación, caché, etc.)
- Manejar errores con try/catch en controladores y middleware específico

## Gestión de imágenes
- Las imágenes se almacenan en public/images/cards/{normal,small,cropped}
- Mantener compatibilidad con formatos JPEG y WebP
- Normalizar passwords de cartas al generar URLs de imágenes
- Usar el sistema de caché implementado en middleware/imageCache.js

## Uso de herramientas automáticas (MCP y Copilot Chat)
- Cuando se pidan tareas relacionadas con operaciones de Git, base de datos MySQL, peticiones HTTP, consola, sistema de archivos, razonamiento secuencial, contexto, automatización de navegador, memoria o búsqueda semántica, se deben usar las herramientas MCP correspondientes (por ejemplo: git_branch, execute_sql, fetch, add_observations, sequentialthinking, get-library-docs, etc.).
- Para tareas generales de análisis, búsqueda, navegación de código, ejecución de notebooks, testing, etc., se deben usar las herramientas genéricas de GitHub Copilot Chat (Codebase, Find Usages, Get Problems, Test Failure, Terminal Selection, Terminal Last Command, Create New Workspace, Create New Jupyter Notebook, Open Simple Browser, Run Notebook Cell, Fetch Web Page, Find Test Files, Search View Results, Search GitHub Repository, etc.).

## Servidores MCP disponibles
- git: Operaciones sobre repositorios Git
- dbhub-mysql: Conexión y operaciones sobre base de datos MySQL
- fetch: Peticiones HTTP
- console-ninja: Herramientas de consola avanzadas
- sequential-thinking: Razonamiento secuencial
- context7: Búsqueda semántica/contextual y documentación de librerías