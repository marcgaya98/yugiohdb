#!/bin/bash

# Script para actualizar configuración MCP con servidores adicionales
# Uso: ./update-mcp-config.sh

echo "=== ACTUALIZANDO CONFIGURACIÓN MCP ==="
echo ""
echo "Agregando MCP recomendados al settings.json de VS Code..."
echo ""

# Backup del archivo actual
cp ~/.config/Code/User/settings.json ~/.config/Code/User/settings.json.backup

echo "✅ Backup creado: settings.json.backup"
echo ""

echo "Para agregar manualmente, añade a tu settings.json:"
echo ""
echo '"filesystem": {'
echo '    "command": "npx",'
echo '    "args": ["-y", "mcp-server-filesystem", "/home/marc/Projects/yugioh"]'
echo '},'
echo ""
echo '"puppeteer": {'
echo '    "command": "npx",'
echo '    "args": ["-y", "mcp-server-puppeteer"]'
echo '},'
echo ""
echo '"everything": {'
echo '    "command": "uvx",'
echo '    "args": ["mcp-server-everything"]'
echo '}'
echo ""
echo "Ver documentación completa en: docs/mcp-configuration.md"
echo ""
echo "📚 DOCUMENTACIÓN DISPONIBLE:"
echo "   - Ejemplos de uso: docs/mcp-examples.md"
echo "   - Guía de configuración: docs/mcp-setup-guide.md"
echo "   - Configuración actual: docs/mcp-configuration.md"
echo ""
echo "🚀 SCRIPTS DISPONIBLES:"
echo "   - Configuración automática: ./setup-mcp.sh"
echo "   - Información rápida: ./show-mcp-info.sh"  
echo "   - Prueba de funcionalidad: ./test-mcp.sh (después de configurar)"
echo ""
echo "🎯 SIGUIENTE PASO:"
echo "   Ejecuta: ./setup-mcp.sh (para configuración automática)"
echo "   O sigue: docs/mcp-setup-guide.md (para configuración manual)"
