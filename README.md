# YuGiOh DB

Base de datos y API para la gestión y consulta de cartas, mazos y datos relacionados con Yu-Gi-Oh!

![Yu-Gi-Oh Logo](https://img.shields.io/badge/YuGiOh-DB-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

## Descripción

Este proyecto implementa una base de datos estructurada y una API REST para acceder a cartas, mazos, personajes y elementos del universo Yu-Gi-Oh!, facilitando la gestión y consulta de datos para aplicaciones relacionadas con el juego.

## Características

- ✅ Modelos completos para cartas (monstruos, hechizos, trampas)
- ✅ Sistema de relaciones entre personajes, mazos y cartas
- ✅ API REST para consulta de datos
- ✅ Soporte para Docker para entorno de desarrollo y producción
- ✅ Middleware personalizado para CORS, cache y validación
- ✅ Sistema de estadísticas de juego (bonuses, challenges, high scores)

## Estructura del proyecto

```
/
├── config/         # Configuración de base de datos
├── controllers/    # Controladores de la API
├── middleware/     # Middlewares para validación, CORS, cache, etc.
├── models/         # Modelos de datos (Sequelize)
├── routes/         # Rutas de la API
├── .github/        # Configuración de GitHub (templates, workflows)
├── .vscode/        # Configuración de VS Code
└── docs/           # Documentación del proyecto
```

## Requisitos previos

- Node.js 18.x o superior
- MySQL 8.x
- Docker y Docker Compose (opcional)

## Instalación

### Configuración tradicional

1. Clone el repositorio:
   ```bash
   git clone https://github.com/Marcelo-Code/yugioh.git
   cd yugioh
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
   git clone https://github.com/Marcelo-Code/yugioh.git
   cd yugioh
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
npm start           # Iniciar la aplicación
npm run dev         # Iniciar en modo desarrollo con nodemon
npm run migrate     # Ejecutar migraciones de base de datos
npm run import:cards    # Importar cartas faltantes
npm run import:decks    # Importar mazos desde JSON
npm run import:characters   # Importar duelistas/personajes
npm run lint        # Ejecutar linter
npm run lint:fix    # Ejecutar linter y corregir automáticamente
npm run format      # Formatear código con Prettier
```

## Estructura de la base de datos

El proyecto utiliza Sequelize como ORM y MySQL como base de datos. Los principales modelos son:

### Modelos principales:
- `Card`: Información básica de cartas
- `MonsterCard`/`SpellCard`/`TrapCard`: Subtipos de cartas
- `Character`: Personajes del universo Yu-Gi-Oh!
- `Deck`: Mazos predefinidos
- `Pack`: Paquetes de cartas

### Modelos de estadísticas:
- `Bonus`: Sistema de bonificaciones
- `Challenge`: Desafíos del juego
- `HighScore`: Puntuaciones altas
- `Icon`: Iconos del juego

### Modelos de obtención:
- `CardCharacterObtention`: Obtención por personaje
- `CardConverterObtention`: Obtención por conversión
- `CardPackObtention`: Obtención por paquetes
- `CardSandwichObtention`: Obtención por sandwich
- `CardTutorialObtention`: Obtención por tutorial

### Otros modelos:
- `Genre`/`GenreCategory`: Géneros y categorías
- `CharacterSandwichRating`: Valoraciones de personajes

## API Endpoints

La API proporciona los siguientes endpoints principales:

- `/api/cards` - Gestión de cartas
- `/api/decks` - Gestión de mazos
- `/api/characters` - Gestión de personajes
- `/api/packs` - Gestión de paquetes
- `/api/obtentions` - Métodos de obtención
- `/api/game-stats` - Estadísticas del juego (bonuses, challenges, high scores)
- `/api/icons` - Gestión de iconos
- `/api/ygoprodeck` - Integración con YGOPRODeck

## Middlewares disponibles

- **CORS**: Configuración de Cross-Origin Resource Sharing
- **Cache Control**: Gestión de cache para optimizar rendimiento
- **Error Handler**: Manejo centralizado de errores
- **Request Logger**: Logging de peticiones HTTP
- **Validate Params**: Validación de parámetros de entrada

## Configuración de entorno

Las principales variables de entorno que necesitas configurar en `.env`:

```bash
PORT=3000                 # Puerto de la aplicación
DB_HOST=localhost         # Host de la base de datos
DB_PORT=3306             # Puerto de MySQL
DB_USER=yugioh           # Usuario de la base de datos
DB_PASSWORD=yugioh       # Contraseña de la base de datos
DB_NAME=yugioh           # Nombre de la base de datos
NODE_ENV=development     # Entorno de ejecución
```

## Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Notas de desarrollo

- El código está organizado por capas para facilitar el mantenimiento y la escalabilidad
- Se utiliza ES6 modules (type: "module" en package.json)
- Configuración de ESLint y Prettier para consistencia de código
- Soporte completo para Docker con archivos de configuración separados para desarrollo y producción

## Licencia

Este proyecto está licenciado bajo la Licencia ISC - vea el archivo [LICENSE](LICENSE) para más detalles.