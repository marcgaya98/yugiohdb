#!/bin/bash

# Configuración Automática de MCP - Yu-Gi-Oh Project
# Este script configura automáticamente los MCP recomendados

set -e  # Salir si hay errores

echo "🚀 CONFIGURACIÓN AUTOMÁTICA DE MCP"
echo "=================================="
echo ""

# 1. Verificar dependencias
echo "📋 Verificando dependencias..."

# Verificar uvx (para servidores Python)
if ! command -v uvx &> /dev/null; then
    echo "❌ uvx no encontrado. Instalando..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source ~/.zshrc
fi

# Verificar npx (para servidores Node.js)
if ! command -v npx &> /dev/null; then
    echo "❌ npx no encontrado. Instala Node.js primero"
    exit 1
fi

echo "✅ Dependencias verificadas"
echo ""

# 2. Backup de configuración actual
echo "💾 Creando backup de configuración..."
SETTINGS_FILE="$HOME/.config/Code/User/settings.json"
BACKUP_FILE="$HOME/.config/Code/User/settings.json.backup.$(date +%Y%m%d_%H%M%S)"

if [ -f "$SETTINGS_FILE" ]; then
    cp "$SETTINGS_FILE" "$BACKUP_FILE"
    echo "✅ Backup creado: $BACKUP_FILE"
else
    echo "⚠️  No se encontró settings.json existente"
fi
echo ""

# 3. Preparar nueva configuración MCP
echo "🔧 Preparando configuración MCP..."

# Crear configuración MCP completa
cat > /tmp/mcp_config.json << 'EOF'
{
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
    }
}
EOF

echo "✅ Configuración MCP preparada"
echo ""

# 4. Preinstalar servidores MCP (opcional pero recomendado)
echo "📦 Preinstalando servidores MCP..."

echo "  - Instalando mcp-server-git..."
uvx --quiet mcp-server-git --version || echo "    ⚠️ Error instalando git server"

echo "  - Instalando mcp-server-fetch..."
uvx --quiet mcp-server-fetch --version || echo "    ⚠️ Error instalando fetch server"

echo "  - Instalando mcp-server-filesystem..."
npx --yes mcp-server-filesystem --version || echo "    ⚠️ Error instalando filesystem server"

echo "  - Instalando mcp-server-puppeteer..."
npx --yes mcp-server-puppeteer --version || echo "    ⚠️ Error instalando puppeteer server"

echo "  - Instalando @bytebase/dbhub..."
npx --yes @bytebase/dbhub --version || echo "    ⚠️ Error instalando dbhub"

echo "✅ Servidores MCP preinstalados"
echo ""

# 5. Crear directorio temporal para SQLite
echo "📁 Creando directorios necesarios..."
mkdir -p /home/marc/Projects/yugioh/temp
touch /home/marc/Projects/yugioh/temp/cache.db
echo "✅ Directorio temp creado"
echo ""

# 6. Mostrar instrucciones finales
echo "🎯 CONFIGURACIÓN COMPLETADA"
echo "=========================="
echo ""
echo "📝 PRÓXIMOS PASOS:"
echo ""
echo "1. Copia la configuración MCP manualmente:"
echo "   - Abre: $SETTINGS_FILE"
echo "   - Agrega el contenido de: /tmp/mcp_config.json"
echo "   - Combina con tu configuración existente"
echo ""
echo "2. Reinicia VS Code para cargar los nuevos MCP"
echo ""
echo "3. Verifica que funcionen:"
echo "   - Abre VS Code"
echo "   - Usa Ctrl+Shift+P → 'MCP: List Servers'"
echo "   - Deberías ver 9 servidores activos"
echo ""
echo "4. Prueba con ejemplos:"
echo "   - Lee: docs/mcp-examples.md"
echo "   - Ejecuta: ./test-mcp.sh"
echo ""
echo "📍 Archivos importantes:"
echo "   - Configuración: /tmp/mcp_config.json"
echo "   - Backup: $BACKUP_FILE"
echo "   - Ejemplos: docs/mcp-examples.md"
echo "   - Cache DB: temp/cache.db"
echo ""
echo "🔧 Para más ayuda:"
echo "   ./show-mcp-info.sh"

# 7. Crear script de test
echo ""
echo "🧪 Creando script de prueba..."
cat > /home/marc/Projects/yugioh/test-mcp.sh << 'EOF'
#!/bin/bash

echo "🧪 PROBANDO CONFIGURACIÓN MCP"
echo "============================="
echo ""

# Test 1: Verificar archivos del proyecto
echo "1. Filesystem MCP - Verificando archivos..."
if [ -f "package.json" ]; then
    echo "   ✅ package.json encontrado"
else
    echo "   ❌ package.json no encontrado"
fi

if [ -f "cards_import_errors.json" ]; then
    echo "   ✅ cards_import_errors.json encontrado"
else
    echo "   ❌ cards_import_errors.json no encontrado"
fi

# Test 2: Verificar base de datos
echo ""
echo "2. Database MCP - Verificando conexión..."
if command -v mysql &> /dev/null; then
    mysql -h localhost -u dbeaveruser -p123456 -e "USE yugioh_db; SELECT COUNT(*) as total_cards FROM cards;" 2>/dev/null || echo "   ❌ Error conectando a BD"
else
    echo "   ⚠️ MySQL no disponible para test"
fi

# Test 3: Verificar Git
echo ""
echo "3. Git MCP - Verificando repositorio..."
if [ -d ".git" ]; then
    echo "   ✅ Repositorio Git encontrado"
    echo "   📊 Status: $(git status --porcelain | wc -l) archivos modificados"
else
    echo "   ❌ No es un repositorio Git"
fi

# Test 4: Verificar conectividad web
echo ""
echo "4. Fetch MCP - Verificando conectividad..."
if curl -s --max-time 5 https://httpbin.org/status/200 > /dev/null; then
    echo "   ✅ Conectividad web OK"
else
    echo "   ❌ Error de conectividad"
fi

echo ""
echo "✅ Test completado. Si VS Code está configurado correctamente,"
echo "   podrás usar todas estas funciones desde el chat de Copilot."
EOF

chmod +x /home/marc/Projects/yugioh/test-mcp.sh
echo "✅ Script de prueba creado: test-mcp.sh"
echo ""

echo "🎉 ¡CONFIGURACIÓN AUTOMÁTICA COMPLETADA!"
echo ""
echo "Siguiente: Edita manualmente tu settings.json de VS Code"
