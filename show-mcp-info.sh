#!/bin/bash

# Shortcut para mostrar información MCP
# Uso: ./show-mcp-info.sh

echo "=== MCP SERVERS CONFIGURADOS ==="
echo ""
echo "1. Git Server (mcp-server-git)"
echo "   - Herramientas: bb7_git_*"
echo "   - Uso: Control de versiones"
echo ""
echo "2. Database MySQL (@bytebase/dbhub)" 
echo "   - Herramientas: bb7_execute_sql"
echo "   - Base de datos: yugioh_db"
echo ""
echo "3. Fetch Server (mcp-server-fetch)"
echo "   - Herramientas: bb7_fetch"
echo "   - Uso: Peticiones HTTP/Web"
echo ""
echo "4. Console Ninja"
echo "   - Herramientas: bb7_runtime-*"
echo "   - Uso: Debugging y logs"
echo ""
echo "Ver documentación completa en: docs/mcp-configuration.md"
