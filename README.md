# YuGiOh DB

Base de datos y API para la gestión y consulta de cartas, mazos y datos relacionados con Yu-Gi-Oh!

![Yu-Gi-Oh Logo](https://img.shields.io/badge/YuGiOh-DB-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

## Descripción

Este proyecto implementa una base de datos estructurada y una API REST para acceder a cartas, mazos, personajes y elementos del universo Yu-Gi-Oh!, facilitando la importación, transformación y consulta de datos para aplicaciones, análisis o desarrollo de herramientas relacionadas con el juego.

## Características

- ✅ Modelos completos para cartas (monstruos, hechizos, trampas)
- ✅ Sistema de relaciones entre personajes, mazos y cartas
- ✅ API REST para consulta de datos
- ✅ Scripts de importación desde diversas fuentes
- ✅ Soporte para Docker para entorno de desarrollo y producción

## Estructura del proyecto

```
/
├── config/         # Configuración de base de datos y servicios
├── controllers/    # Controladores de la API
├── middleware/     # Middlewares para la aplicación
├── models/         # Modelos de datos (Sequelize)
├── routes/         # Rutas de la API
├── scripts/        # Scripts para importación y transformación de datos
├── services/       # Servicios externos e internos
└── utils/          # Utilidades y funciones auxiliares
```

## Requisitos previos

- Node.js 18.x o superior
- MySQL 8.x
- Docker y Docker Compose (opcional)

## Instalación

### Configuración tradicional

1. Clone el repositorio:
   ```bash
   git clone https://github.com/usuario/yugiohdb.git
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
   node app.js
   ```

### Uso con Docker

1. Clone el repositorio:
   ```bash
   git clone https://github.com/usuario/yugiohdb.git
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

## Scripts disponibles

- Para ejecutar scripts de importación (usando Docker):
   ```bash
   make run-script  # Seguir las instrucciones
   ```
   
   O manualmente:
   ```bash
   docker-compose exec app node scripts/nombreDelScript.js
   ```

## Estructura de la base de datos

El proyecto utiliza Sequelize como ORM y MySQL como base de datos. Los principales modelos son:

- `Card`: Información básica de cartas
- `MonsterCard`/`SpellCard`/`TrapCard`: Subtipos de cartas
- `Character`: Personajes del universo Yu-Gi-Oh!
- `Deck`: Mazos predefinidos
- `Genre`: Géneros y categorías de cartas
- `CardObtention`: Métodos de obtención de cartas

## API Endpoints

La API proporciona los siguientes endpoints principales:

- `/api/cards` - Gestión de cartas
- `/api/decks` - Gestión de mazos
- `/api/characters` - Gestión de personajes
- `/api/packs` - Gestión de paquetes
- `/api/obtentions` - Métodos de obtención

## Contribución

Las contribuciones son bienvenidas. Por favor, abra un issue antes de enviar un pull request.

## Licencia

Este proyecto está licenciado bajo la Licencia ISC - vea el archivo LICENSE para más detalles.
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

## Notas

- Los archivos JSON en la raíz y muchos scripts son utilidades de pruebas y experimentación para poblar y depurar la base de datos.
- El código está organizado por capas para facilitar el mantenimiento y la escalabilidad.
- Se recomienda limpiar los datos y scripts de pruebas antes de un despliegue en producción.

## Licencia

MIT