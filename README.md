# YuGiOh DB

Base de datos completa y API REST para la gestión y consulta de cartas, mazos, personajes y estadísticas del universo Yu-Gi-Oh!

![Yu-Gi-Oh Logo](https://img.shields.io/badge/YuGiOh-DB-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)
![Docker](https://img.shields.io/badge/Docker-ready-blue)

## Descripción

YuGiOh DB es una base de datos completa y API REST profesional que gestiona el universo completo de Yu-Gi-Oh! Incluye cartas (monstruos, hechizos, trampas), personajes, mazos, métodos de obtención, estadísticas de juego y un sistema completo de relaciones entre todas las entidades.

El proyecto está diseñado con arquitectura modular, soporta Docker para despliegue fácil, y proporciona endpoints RESTful para todas las operaciones de consulta y gestión de datos.

## Características principales

- 🃏 **Gestión completa de cartas**: Monstruos, hechizos, trampas con todos sus atributos
- 👥 **Sistema de personajes**: Duelistas y personajes del universo Yu-Gi-Oh!
- 🎴 **Gestión de mazos**: Mazos predefinidos con relaciones carta-mazo
- 📦 **Sistema de paquetes**: Paquetes de cartas y métodos de obtención
- 🎯 **Estadísticas de juego**: Bonificaciones, desafíos, puntuaciones altas
- 🖼️ **Gestión de imágenes**: Sistema completo de descarga y caché de imágenes de cartas
- 🔗 **Relaciones complejas**: Sistema completo de asociaciones entre entidades
- 🌐 **API REST completa**: Endpoints para todas las operaciones CRUD
- 🐳 **Soporte Docker**: Configuración completa para desarrollo y producción
- 🛡️ **Middlewares avanzados**: CORS, cache, validación, logging y manejo de errores
- 📊 **Base de datos optimizada**: Modelos Sequelize con relaciones eficientes

## Estructura del proyecto

```
yugiohdb/
├── 📁 config/           # Configuración de base de datos y entorno
├── 📁 controllers/      # Controladores de la API REST
│   ├── CardController.js
│   ├── CharacterController.js
│   ├── DeckController.js
│   ├── GameStatsController.js
│   ├── IconController.js
│   ├── ObtentionController.js
│   └── PackController.js
├── 📁 middleware/       # Middlewares personalizados
│   ├── cacheControl.js
│   ├── cors.js
│   ├── errorHandler.js
│   ├── requestLogger.js
│   └── validateParams.js
├── 📁 models/          # Modelos de datos Sequelize
│   ├── associations.js # Centralización de relaciones
│   ├── Card.js         # Modelo base de cartas
│   ├── MonsterCard.js  # Cartas de monstruo
│   ├── SpellCard.js    # Cartas de hechizo
│   ├── TrapCard.js     # Cartas de trampa
│   ├── Character.js    # Personajes/Duelistas
│   ├── Deck.js         # Mazos
│   ├── Pack.js         # Paquetes
│   └── [otros modelos...]
├── 📁 routes/          # Definición de rutas API
├── 📁 .github/         # Templates y workflows de GitHub
├── 📁 .vscode/         # Configuración de VS Code
├── 🐳 Docker files     # Configuración de contenedores
├── 📋 Makefile         # Comandos automatizados
└── 📖 docs/            # Documentación del proyecto
```

## Requisitos previos

- Node.js 18.x o superior
- MySQL 8.x
- Docker y Docker Compose (opcional)

## Instalación

### Configuración tradicional

1. Clone el repositorio:
   ```bash
   git clone https://github.com/marcgaya98/yugiohdb.git
   cd yugiohdb
   ```

2. Instale las dependencias:
   ```bash
   npm install
   ```

3. Cree un archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure las variables de entorno en el archivo `.env`

5. Ejecute la aplicación:
   ```bash
   npm start
   ```

### Uso con Docker

1. Clone el repositorio:
   ```bash
   git clone https://github.com/marcgaya98/yugiohdb.git
   cd yugiohdb
   ```

2. Cree un archivo `.env` basado en `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Construya e inicie los contenedores (usando Makefile):
   ```bash
   make build
   make up
   ```
   
   O manualmente:
   ```bash
   docker-compose up -d
   ```

4. Para acceder a la shell de la base de datos:
   ```bash
   make db-shell
   ```

5. Para detener los contenedores:
   ```bash
   make down
   ```

### Desarrollo con Docker

Para desarrollo, puedes usar:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

Esto montará tu código como volumen para desarrollo en tiempo real.

## Scripts disponibles

El proyecto incluye varios scripts npm para diferentes tareas:

```bash
npm start              # Iniciar la aplicación
npm run dev            # Iniciar en modo desarrollo con nodemon
npm run migrate        # Ejecutar migraciones de base de datos
npm run import:cards   # Importar cartas faltantes desde fuentes externas
npm run import:decks   # Importar mazos desde archivos JSON
npm run import:characters  # Importar duelistas/personajes
npm run download:images    # Descargar todas las imágenes de cartas localmente
npm run migrate:image-urls # Migrar URLs de imágenes a rutas locales
npm run check:image-urls   # Verificar estado de migración de imágenes
npm run revert:image-urls  # Revertir URLs a externas (rollback)
npm run lint           # Ejecutar ESLint para verificar código
npm run lint:fix       # Ejecutar ESLint y corregir automáticamente
npm run format         # Formatear código con Prettier
npm test               # Ejecutar tests (pendiente de implementación)
npm run build          # Comando de build (no requerido actualmente)
```

## Arquitectura de la base de datos

El proyecto utiliza **Sequelize ORM** con **MySQL 8.x** y una arquitectura de modelos bien estructurada:

### 🃏 Modelos principales de cartas:
- **`Card`**: Modelo base con información común (ID Konami, nombre, descripción, etc.)
- **`MonsterCard`**: Extensión para monstruos (ATK, DEF, nivel, atributo, tipo)
- **`SpellCard`**: Extensión para hechizos (tipo de hechizo, efectos)
- **`TrapCard`**: Extensión para trampas (tipo de trampa, efectos)

### 👥 Modelos de entidades:
- **`Character`**: Personajes y duelistas del universo Yu-Gi-Oh!
- **`Deck`**: Mazos predefinidos con metadatos
- **`Pack`**: Paquetes de cartas disponibles
- **`Genre`**: Sistema de géneros y categorías

### 🔗 Modelos de relaciones:
- **`DeckCard`**: Relación muchos-a-muchos entre mazos y cartas
- **`CardGenre`**: Relación muchos-a-muchos entre cartas y géneros
- **`CardInitialDeck`**: Cartas en mazos iniciales de personajes

### 📊 Modelos de obtención:
- **`CardCharacterObtention`**: Obtención de cartas derrotando personajes
- **`CardConverterObtention`**: Obtención mediante conversión/intercambio
- **`CardPackObtention`**: Obtención a través de paquetes
- **`CardSandwichObtention`**: Obtención por método sandwich
- **`CardTutorialObtention`**: Obtención en tutoriales

### 🎮 Modelos de estadísticas de juego:
- **`Bonus`**: Sistema de bonificaciones del juego
- **`Challenge`**: Desafíos y objetivos
- **`HighScore`**: Sistema de puntuaciones altas
- **`Icon`**: Iconos y elementos visuales del juego
- **`CharacterSandwichRating`**: Valoraciones específicas de personajes

## API Endpoints

La API REST proporciona endpoints completos para todas las entidades:

### 🃏 Gestión de cartas
- **`GET /api/cards`** - Listar cartas con filtros avanzados
- **`GET /api/cards/:id`** - Obtener carta específica con relaciones
- **`POST /api/cards`** - Crear nueva carta
- **`PUT /api/cards/:id`** - Actualizar carta existente
- **`DELETE /api/cards/:id`** - Eliminar carta

### 👥 Gestión de personajes
- **`GET /api/characters`** - Listar todos los personajes
- **`GET /api/characters/:id`** - Obtener personaje específico
- **`GET /api/characters/:id/decks`** - Mazos de un personaje

### 🎴 Gestión de mazos
- **`GET /api/decks`** - Listar mazos disponibles
- **`GET /api/decks/:id`** - Obtener mazo con cartas incluidas
- **`GET /api/decks/:id/cards`** - Cartas de un mazo específico

### 📦 Gestión de paquetes
- **`GET /api/packs`** - Listar paquetes de cartas
- **`GET /api/packs/:id`** - Obtener paquete específico
- **`GET /api/packs/:id/cards`** - Cartas disponibles en un paquete

### 🎯 Métodos de obtención
- **`GET /api/obtentions`** - Listar métodos de obtención
- **`GET /api/obtentions/character/:id`** - Obtención por personaje
- **`GET /api/obtentions/pack/:id`** - Obtención por paquete
- **`GET /api/obtentions/tutorial`** - Obtención por tutorial

### 📊 Estadísticas de juego
- **`GET /api/game-stats/bonuses`** - Sistema de bonificaciones
- **`GET /api/game-stats/challenges`** - Desafíos disponibles
- **`GET /api/game-stats/high-scores`** - Puntuaciones altas
- **`GET /api/game-stats/icons`** - Iconos del juego

### 🔍 Búsquedas avanzadas
- **`GET /api/cards/search?q=:term`** - Búsqueda de cartas por término
- **`GET /api/cards/filter?type=:type&attribute=:attr`** - Filtros específicos

### 🖼️ Gestión de imágenes
- **`GET /api/images/stats`** - Estadísticas de imágenes almacenadas
- **`POST /api/images/download`** - Iniciar descarga masiva de imágenes
- **`GET /api/images/missing`** - Listar cartas sin imágenes descargadas
- **`DELETE /api/images/cleanup`** - Limpiar imágenes huérfanas
- **`DELETE /api/images/:type/:password`** - Eliminar imagen específica

## Middlewares disponibles

El proyecto incluye middlewares personalizados para optimizar la API:

- **🌐 CORS**: Configuración de Cross-Origin Resource Sharing para acceso desde diferentes dominios
- **⚡ Cache Control**: Gestión inteligente de cache para optimizar rendimiento y reducir carga
- **🛡️ Error Handler**: Manejo centralizado y consistente de errores con logging
- **📋 Request Logger**: Logging detallado de peticiones HTTP para debugging y monitoreo
- **✅ Validate Params**: Validación robusta de parámetros de entrada y tipos de datos

## Configuración de entorno

Variables de entorno principales en `.env`:

```bash
# Configuración del servidor
PORT=3000                    # Puerto de la aplicación

# Configuración de base de datos MySQL
DB_HOST=db                   # Host de la base de datos (db para Docker)
DB_PORT=3306                 # Puerto de MySQL
DB_USER=yugioh              # Usuario de la base de datos
DB_PASSWORD=yugioh          # Contraseña de la base de datos
DB_NAME=yugioh              # Nombre de la base de datos
DB_ROOT_PASSWORD=root       # Contraseña root de MySQL (para Docker)

# Configuración de entorno
NODE_ENV=development        # Entorno de ejecución (development/production)
```

### Configuración para diferentes entornos:

- **Desarrollo local**: Usar `DB_HOST=localhost`
- **Docker**: Usar `DB_HOST=db` (nombre del servicio)
- **Producción**: Configurar según el proveedor de base de datos

## Contribución

¡Las contribuciones son bienvenidas! Para contribuir al proyecto:

1. **Fork** el repositorio
2. **Clone** tu fork: `git clone https://github.com/TU_USUARIO/yugiohdb.git`
3. **Crea una rama** para tu feature: `git checkout -b feature/nueva-caracteristica`
4. **Desarrolla** siguiendo las convenciones del proyecto
5. **Testa** tus cambios (asegúrate de que todo funciona correctamente)
6. **Commit** con mensajes descriptivos: `git commit -m "feat: añade nueva característica"`
7. **Push** a tu fork: `git push origin feature/nueva-caracteristica`
8. **Crea un Pull Request** al repositorio original

### 📋 Guías de contribución

- Consulta [`CONTRIBUTING.md`](./CONTRIBUTING.md) para lineamientos detallados
- Sigue las convenciones de [Conventional Commits](https://www.conventionalcommits.org/)
- Usa ESLint y Prettier (ya configurados en el proyecto)
- Documenta cambios significativos en la API

### 🔄 Flujo de trabajo con Git

Para más detalles sobre el flujo de trabajo con Git y las mejores prácticas de colaboración, consulta nuestra [Guía de Control de Versiones](./docs/GIT_WORKFLOW.md).

## Tecnologías utilizadas

### Backend y Base de Datos
- **Node.js** (≥18.x) - Runtime de JavaScript
- **Express.js** (v5.x) - Framework web minimalista
- **MySQL** (8.x) - Sistema de gestión de base de datos
- **Sequelize** (v6.x) - ORM para Node.js

### Herramientas de Desarrollo
- **ESLint** - Linting y análisis de código
- **Prettier** - Formateo automático de código
- **Nodemon** - Recarga automática en desarrollo
- **Docker & Docker Compose** - Contenedorización

### Librerías Especializadas
- **Puppeteer** - Web scraping y automatización
- **Cheerio** - Manipulación de DOM del lado del servidor
- **JSDOM** - Implementación de DOM para Node.js
- **node-fetch** - Cliente HTTP para APIs externas
- **bcryptjs** - Hashing de contraseñas
- **jsonwebtoken** - Gestión de tokens JWT

## Notas de desarrollo

- 📦 **Arquitectura modular**: Código organizado por capas para facilitar mantenimiento
- 🔧 **ES6 Modules**: Uso de `import/export` (configurado en `package.json`)
- 🎯 **API RESTful**: Endpoints siguiendo estándares REST
- 🏗️ **Patrones de diseño**: Separación de responsabilidades entre controladores, modelos y rutas
- 🛡️ **Validación robusta**: Middleware personalizado para validación de datos
- 📝 **Logging detallado**: Sistema de logs para debugging y monitoreo
- 🚀 **Optimización**: Cache inteligente y manejo eficiente de consultas
- 🧪 **Preparado para testing**: Estructura lista para implementar tests unitarios

## Características avanzadas

- **Relaciones complejas**: Sistema completo de asociaciones Sequelize
- **Importación masiva**: Scripts para importar datos desde fuentes externas
- **Scraping inteligente**: Herramientas para obtener datos de APIs públicas
- **Cache estratégico**: Optimización de consultas frecuentes
- **Error handling**: Manejo centralizado y logging de errores
- **Docker ready**: Configuración completa para desarrollo y producción

## Roadmap y próximas características

### 🚧 En desarrollo
- [ ] **Tests unitarios e integración** - Suite completa de tests
- [ ] **API de autenticación** - Sistema de usuarios y permisos
- [ ] **Documentación API** - Swagger/OpenAPI documentation
- [ ] **GraphQL endpoint** - API GraphQL como alternativa a REST

### 🎯 Planificado
- [ ] **Dashboard web** - Interfaz administrativa web
- [ ] **API rate limiting** - Limitación de peticiones por IP
- [ ] **Websockets** - Actualizaciones en tiempo real
- [ ] **Exportación de datos** - Exportar datos en múltiples formatos
- [ ] **API caching avanzado** - Redis para cache distribuido
- [ ] **Monitoring y métricas** - Integración con herramientas de monitoreo

### 💡 Ideas futuras
- [ ] **Machine Learning** - Recomendaciones de cartas basadas en IA
- [ ] **API pública** - Endpoints públicos con documentación
- [ ] **Mobile SDK** - SDK para aplicaciones móviles
- [ ] **Integración blockchain** - NFTs y blockchain gaming

## 📞 Soporte y contacto

- **Issues**: [GitHub Issues](https://github.com/marcgaya98/yugiohdb/issues)
- **Documentación**: Consulta la carpeta `docs/` para guías detalladas
- **Contribuciones**: Lee [`CONTRIBUTING.md`](./CONTRIBUTING.md) antes de contribuir

## Licencia

Este proyecto está licenciado bajo la **Licencia ISC** - consulta el archivo [LICENSE](LICENSE) para más detalles.

---

**⭐ Si este proyecto te resulta útil, ¡no olvides darle una estrella en GitHub!**

*Desarrollado con ❤️ para la comunidad de Yu-Gi-Oh!*