# Guía de Configuración MCP - Paso a Paso

## 🎯 Configuración Manual (Si prefieres hacerlo manualmente)

### Paso 1: Instalar Dependencias Base

```bash
# 1. Instalar uv (para servidores Python MCP)
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.zshrc

# 2. Verificar Node.js y npm (ya los tienes)
node --version  # Debe ser 18+
npm --version
```

### Paso 2: Instalar Servidores MCP Individuales

```bash
# Servidores Python (con uvx)
uvx mcp-server-git --version
uvx mcp-server-fetch --version  
uvx mcp-server-everything --version
uvx mcp-server-time --version
uvx mcp-server-sqlite --version

# Servidores Node.js (con npx)
npx -y mcp-server-filesystem --version
npx -y mcp-server-puppeteer --version
npx -y @bytebase/dbhub --version
```

### Paso 3: Configurar VS Code Settings

Abre `~/.config/Code/User/settings.json` y agrega:

```json
{
    "github.copilot.enable": {
        "*": true,
        "plaintext": true,
        "markdown": false,
        "scminput": false
    },
    "editor.guides.bracketPairs": true,
    "terminal.integrated.env.linux": {},
    "workbench.productIconTheme": "fluent-icons",
    "workbench.iconTheme": "symbols",
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
            },
            "sqlite": {
                "command": "uvx",
                "args": ["mcp-server-sqlite", "/home/marc/Projects/yugioh/temp/cache.db"]
            }
        }
    },
    "makefile.configureOnOpen": true
}
```

### Paso 4: Crear Directorios Necesarios

```bash
# Crear directorio para cache SQLite
mkdir -p /home/marc/Projects/yugioh/temp
touch /home/marc/Projects/yugioh/temp/cache.db

# Crear directorio para reportes (opcional)
mkdir -p /home/marc/Projects/yugioh/reports
```

### Paso 5: Verificar Configuración

1. **Reinicia VS Code completamente**
2. **Abre el proyecto Yu-Gi-Oh**
3. **Verifica MCP activos:**
   - `Ctrl+Shift+P` → `MCP: List Servers`
   - Deberías ver 9 servidores activos

### Paso 6: Probar Funcionalidad

```bash
# Ejecutar script de prueba
./test-mcp.sh

# O probar manualmente en el chat:
# "Ejecuta una consulta SQL para contar las cartas"
# "Lee el archivo package.json"
# "Haz commit de los cambios pendientes"
```

## 🔧 Configuraciones Específicas por MCP

### Filesystem MCP
- **Configuración**: Apunta al directorio del proyecto
- **Propósito**: Leer/escribir archivos JSON de datos
- **Archivos clave**: `cards_import_errors.json`, `all_decks.json`, etc.

### Database MCP
- **Configuración**: DSN de MySQL con credenciales
- **Propósito**: Consultas SQL directas a yugioh_db
- **Credenciales**: `dbeaveruser:123456@localhost:3306`

### Puppeteer MCP
- **Configuración**: Sin configuración especial
- **Propósito**: Mejorar scraping existente
- **Uso**: Complementa `scrapePacks.js`, `scrapeSandwich.js`

### Git MCP
- **Configuración**: Detecta repo automáticamente
- **Propósito**: Control de versiones programático
- **Uso**: Commits automáticos después de imports

### Fetch MCP
- **Configuración**: Sin configuración especial
- **Propósito**: APIs externas y validación de datos
- **Uso**: Verificar cartas con YGOPRODeck API

## ⚠️ Solución de Problemas

### Problema: MCP no aparece en la lista
**Solución**: 
1. Verificar sintaxis JSON en settings.json
2. Reiniciar VS Code completamente
3. Verificar que las dependencias estén instaladas

### Problema: Error de conexión a BD
**Solución**:
1. Verificar que MySQL esté corriendo
2. Verificar credenciales en DSN
3. Probar conexión manual: `mysql -h localhost -u dbeaveruser -p123456`

### Problema: Error con uvx
**Solución**:
1. Reinstalar uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. Recargar shell: `source ~/.zshrc`
3. Verificar PATH: `echo $PATH`

### Problema: Puppeteer no funciona
**Solución**:
1. Instalar dependencias de Chrome: `sudo apt install chromium-browser`
2. Verificar permisos de archivo
3. Probar instalación: `npx puppeteer --version`

## 📊 Verificación Final

Después de la configuración, deberías poder:

✅ **Ejecutar consultas SQL**: `bb7_execute_sql`
✅ **Leer archivos del proyecto**: `read_file`
✅ **Hacer commits**: `bb7_git_commit`
✅ **Obtener datos web**: `bb7_fetch`
✅ **Controlar navegador**: `puppeteer_*`
✅ **Buscar en archivos**: `search_*`

## 🚀 Próximos Pasos

Una vez configurado:

1. **Lee los ejemplos**: `docs/mcp-examples.md`
2. **Prueba funcionalidad**: `./test-mcp.sh`
3. **Experimenta en chat**: "Muestra las 10 cartas más usadas en mazos"
4. **Automatiza tareas**: Scripts de import mejorados

## 📞 Soporte

Si tienes problemas:
1. Ejecuta `./test-mcp.sh` para diagnóstico
2. Revisa logs de VS Code: `Help → Toggle Developer Tools → Console`
3. Verifica configuración: `./show-mcp-info.sh`
