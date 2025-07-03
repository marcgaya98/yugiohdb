# MCP (Model Context Protocol) Configuration

## Servidores MCP Disponibles

Esta documentación describe los servidores MCP configurados en VS Code para el proyecto Yu-Gi-Oh.

### Configuración actual en `~/.config/Code/User/settings.json`:

```json
"mcp": {
    "servers": {
        "git": {
            "command": "uvx",
            "args": ["mcp-server-git"]
        },
        "dbhub-mysql": {
            "command": "npx",
            "args": [
                "-y",
                "@bytebase/dbhub",
                "--transport",
                "stdio",
                "--dsn",
                "mysql://dbeaveruser:123456@localhost:3306/yugioh_db?sslmode=disable"
            ]
        },
        "fetch": {
            "command": "uvx",
            "args": ["mcp-server-fetch"]
        },
        "console-ninja": {
            "command": "npx",
            "args": ["-y", "-c", "node ~/.console-ninja/mcp/"]
        },
        "filesystem": {
            "command": "npx",
            "args": ["-y", "mcp-server-filesystem", "/home/marc/Projects/yugioh"]
        },
        "puppeteer": {
            "command": "npx",
            "args": ["-y", "mcp-server-puppeteer"]
        },
        "everything": {
            "command": "uvx",
            "args": ["mcp-server-everything"]
        },
        "time": {
            "command": "uvx",
            "args": ["mcp-server-time"]
        }
    }
}
```

## Herramientas MCP Disponibles

### 1. Git Server (`mcp-server-git`)
- **Propósito**: Operaciones de control de versiones
- **Herramientas disponibles**:
  - `bb7_git_add` - Añadir archivos al staging
  - `bb7_git_commit` - Crear commits
  - `bb7_git_status` - Ver estado del repositorio
  - `bb7_git_diff` - Ver diferencias
  - `bb7_git_log` - Ver historial de commits
  - `bb7_git_checkout` - Cambiar branches
  - `bb7_git_create_branch` - Crear nuevas ramas
  - `bb7_git_reset` - Resetear cambios
  - `bb7_git_show` - Mostrar contenido de commits

### 2. Database Hub MySQL (`@bytebase/dbhub`)
- **Propósito**: Interacción con la base de datos MySQL
- **Base de datos**: `yugioh_db`
- **Herramientas disponibles**:
  - `bb7_execute_sql` - Ejecutar consultas SQL

### 3. Fetch Server (`mcp-server-fetch`)
- **Propósito**: Realizar peticiones HTTP y obtener contenido web
- **Herramientas disponibles**:
  - `bb7_fetch` - Obtener contenido de URLs

### 4. Console Ninja
- **Propósito**: Debugging avanzado y logs
- **Herramientas disponibles**:
  - `bb7_runtime-logs` - Logs de aplicación
  - `bb7_runtime-errors` - Errores de runtime
  - `bb7_runtime-logs-and-errors` - Logs y errores combinados
  - `bb7_runtime-logs-by-location` - Logs por ubicación específica

## MCP Adicionales Recomendados

### Para desarrollo avanzado del proyecto Yu-Gi-Oh, considera instalar estos MCP:

#### 1. Filesystem MCP
```json
"filesystem": {
    "command": "npx",
    "args": ["-y", "mcp-server-filesystem", "/home/marc/Projects/yugioh"]
}
```
- **Uso**: Manipulación avanzada de archivos JSON de datos
- **Herramientas**: Lectura/escritura directa de archivos
- **Ideal para**: Procesar `all_decks.json`, `sandwich_ratings_*.json`, etc.

#### 2. Puppeteer MCP
```json
"puppeteer": {
    "command": "npx", 
    "args": ["-y", "mcp-server-puppeteer"]
}
```
- **Uso**: Automatización avanzada de scraping
- **Herramientas**: Control directo del navegador
- **Ideal para**: Mejorar `scrapePacks.js`, `scrapeCharacter.js`, `scrapeSandwich.js`

#### 3. Sequelize MCP
```json
"sequelize": {
    "command": "npx",
    "args": ["-y", "mcp-server-sequelize", "--config", "./config/database.js"]
}
```
- **Uso**: Interacción directa con modelos
- **Herramientas**: Migraciones, validaciones, consultas ORM
- **Ideal para**: Debugging de relaciones de modelos

#### 4. Everything MCP
```json
"everything": {
    "command": "uvx",
    "args": ["mcp-server-everything"]
}
```
- **Uso**: Búsqueda avanzada en archivos
- **Herramientas**: Indexación y búsqueda rápida
- **Ideal para**: Buscar en logs, JSONs, encontrar errores

#### 5. Time MCP
```json
"time": {
    "command": "uvx", 
    "args": ["mcp-server-time"]
}
```
- **Uso**: Programación de tareas
- **Herramientas**: Scheduling, timestamps
- **Ideal para**: Automatizar imports periódicos

#### 6. SQLite MCP
```json
"sqlite": {
    "command": "uvx",
    "args": ["mcp-server-sqlite", "./temp/cache.db"]
}
```
- **Uso**: Cache temporal y análisis
- **Herramientas**: Base de datos ligera para tests
- **Ideal para**: Cache de scraping, datos temporales

### Configuración Completa Sugerida

```json
"mcp": {
    "servers": {
        "git": {
            "command": "uvx",
            "args": ["mcp-server-git"]
        },
        "dbhub-mysql": {
            "command": "npx",
            "args": [
                "-y", "@bytebase/dbhub", "--transport", "stdio",
                "--dsn", "mysql://dbeaveruser:123456@localhost:3306/yugioh_db?sslmode=disable"
            ]
        },
        "fetch": {
            "command": "uvx",
            "args": ["mcp-server-fetch"]
        },
        "console-ninja": {
            "command": "npx",
            "args": ["-y", "-c", "node ~/.console-ninja/mcp/"]
        },
        "filesystem": {
            "command": "npx",
            "args": ["-y", "mcp-server-filesystem", "/home/marc/Projects/yugioh"]
        },
        "puppeteer": {
            "command": "npx",
            "args": ["-y", "mcp-server-puppeteer"]
        },
        "everything": {
            "command": "uvx",
            "args": ["mcp-server-everything"]
        },
        "time": {
            "command": "uvx",
            "args": ["mcp-server-time"]
        }
    }
}
```

## Uso Común

### Consultas a la Base de Datos
```sql
-- Ejemplo: Ver todos los personajes
SELECT * FROM characters LIMIT 10;
```

### Operaciones Git
- Revisar estado: usar `bb7_git_status`
- Hacer commit: usar `bb7_git_add` + `bb7_git_commit`
- Ver diferencias: usar `bb7_git_diff`

### Obtener datos web
- Usar `bb7_fetch` para APIs externas o scraping

## Casos de Uso Específicos

### Scraping Mejorado
- **Puppeteer MCP**: Automatizar `scrapePacks.js` con mejor control de errores
- **Time MCP**: Programar scraping periódico sin sobrecargar servidores
- **SQLite MCP**: Cache de datos scraped para evitar re-scraping

### Análisis de Datos  
- **Everything MCP**: Buscar errores en `cards_import_errors.json`
- **Filesystem MCP**: Procesar masivamente archivos JSON
- **Sequelize MCP**: Validar integridad de relaciones entre modelos

### Debugging Avanzado
- **Memory MCP**: Persistir variables de debugging entre sesiones
- **Console Ninja**: Logs en tiempo real de scripts de import
- **Git MCP**: Tracking de cambios en archivos de datos

## Notas
- Todos los MCP están configurados a nivel de usuario de VS Code
- La base de datos usa las credenciales: `dbeaveruser:123456@localhost:3306`
- Los comandos `uvx` requieren que esté instalado uv (Python package manager)
- Los comandos `npx` usan Node.js

## Última actualización
Julio 2025
