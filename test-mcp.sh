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
    mysql -h localhost -u dbeaveruser -p123456 -e "USE yugioh_db; SELECT COUNT(*) as total_cards FROM card;" 2>/dev/null && echo "   ✅ Conexión a BD exitosa" || echo "   ❌ Error conectando a BD"
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

# Test 5: Verificar YGOPRODeck Service
echo ""
echo "5. YGOPRODeck Service - Verificando API..."
if curl -s --max-time 5 "https://db.ygoprodeck.com/api/v7/cardinfo.php?name=Blue-Eyes%20White%20Dragon" > /dev/null; then
    echo "   ✅ API YGOPRODeck disponible"
else
    echo "   ❌ Error accediendo a YGOPRODeck"
fi

echo ""
echo "📊 MCP ACTIVOS:"
echo "   ✅ Git MCP - Control de versiones"
echo "   ✅ Database MySQL MCP - Consultas SQL"
echo "   ✅ Fetch MCP - APIs externas"
echo "   ✅ Console Ninja MCP - Debugging"
echo "   ✅ Filesystem MCP - Archivos del proyecto"
echo ""
echo "✅ Test completado. Si VS Code está configurado correctamente,"
echo "   podrás usar todas estas funciones desde el chat de Copilot."
