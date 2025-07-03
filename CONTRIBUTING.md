# Guía de Contribución - YuGiOh DB

## Control de Versiones y Flujo de Trabajo

### Estructura de Ramas

Este proyecto utiliza un flujo de trabajo basado en ramas con la siguiente estructura:

- **`main`** - Rama principal de producción
- **`develop`** - Rama de desarrollo e integración
- **`feature/*`** - Ramas para nuevas características
- **`hotfix/*`** - Ramas para correcciones urgentes
- **`release/*`** - Ramas para preparar lanzamientos

### Configuración Inicial

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Marcelo-Code/yugioh.git
   cd yugioh
   ```

2. **Configurar el repositorio remoto:**
   ```bash
   git remote -v
   git fetch --all
   ```

3. **Configurar tu información de usuario:**
   ```bash
   git config user.name "Tu Nombre"
   git config user.email "tu.email@example.com"
   ```

### Flujo de Trabajo para Desarrolladores

#### 1. Crear una nueva característica

```bash
# Cambiar a develop y actualizar
git checkout develop
git pull origin develop

# Crear rama de característica
git checkout -b feature/nombre-de-la-caracteristica

# Trabajar en tu característica...
# Hacer commits regulares con mensajes descriptivos
git add .
git commit -m "feat: descripción de la característica"

# Pushear la rama
git push -u origin feature/nombre-de-la-caracteristica
```

#### 2. Actualizar modelos de base de datos

Cuando actualices modelos (como hicimos hoy):

```bash
# Crear rama específica para modelos
git checkout -b refactor/update-database-models

# Hacer cambios en los modelos...
git add models/
git commit -m "refactor: Update models to match database schema

- Updated Genre model to include category ENUM field
- Updated CharacterSandwichRating with proper schema
- Removed deprecated GenreCategory model"

# Push y crear PR
git push -u origin refactor/update-database-models
```

#### 3. Correcciones urgentes (hotfix)

```bash
# Desde main para hotfixes
git checkout main
git pull origin main
git checkout -b hotfix/descripcion-del-problema

# Hacer la corrección
git add .
git commit -m "fix: descripción de la corrección urgente"

# Push y merge directo a main después de revisión
git push -u origin hotfix/descripcion-del-problema
```

### Convenciones de Commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

- **`feat:`** - Nueva característica
- **`fix:`** - Corrección de bug
- **`docs:`** - Cambios en documentación
- **`refactor:`** - Refactorización de código
- **`test:`** - Añadir o modificar tests
- **`chore:`** - Tareas de mantenimiento
- **`style:`** - Cambios de formato/estilo
- **`perf:`** - Mejoras de rendimiento

#### Ejemplos de commits buenos:

```bash
git commit -m "feat: add character search functionality"
git commit -m "fix: resolve null reference in Genre model"
git commit -m "refactor: update database models to match schema"
git commit -m "docs: update API documentation for cards endpoint"
git commit -m "test: add unit tests for CharacterController"
```

### Comandos Git Útiles

#### Estado y información
```bash
git status                    # Ver estado actual
git log --oneline -10        # Ver últimos 10 commits
git branch -a               # Ver todas las ramas
git remote -v               # Ver repositorios remotos
```

#### Trabajando con cambios
```bash
git add .                   # Añadir todos los cambios
git add archivo.js          # Añadir archivo específico
git reset HEAD archivo.js   # Quitar archivo del stage
git checkout -- archivo.js # Descartar cambios no commiteados
```

#### Ramas
```bash
git checkout develop        # Cambiar a rama develop
git checkout -b nueva-rama  # Crear y cambiar a nueva rama
git branch -d rama-vieja   # Eliminar rama local
git push origin --delete rama-remota  # Eliminar rama remota
```

#### Sincronización
```bash
git fetch origin           # Descargar cambios sin merge
git pull origin develop    # Descargar y merge desde develop
git push origin rama       # Subir cambios a rama
git push --force-with-lease # Push forzado seguro
```

### Proceso de Code Review

1. **Antes del Pull Request:**
   - Asegúrate que tu código compila sin errores
   - Ejecuta los tests: `npm test`
   - Ejecuta el linter: `npm run lint`
   - Actualiza la documentación si es necesario

2. **Crear Pull Request:**
   - Título descriptivo
   - Descripción detallada de los cambios
   - Referencia a issues relacionados
   - Screenshots si aplica

3. **Después del review:**
   - Aplicar feedback recibido
   - Hacer push de los cambios
   - Solicitar re-review si es necesario

### Mantenimiento del Repositorio

#### Limpiar ramas obsoletas
```bash
# Listar ramas merged
git branch --merged develop

# Eliminar ramas locales merged
git branch --merged develop | grep -v "develop\|main" | xargs -n 1 git branch -d

# Limpiar referencias remotas
git remote prune origin
```

#### Actualizar dependencias
```bash
# Crear rama para actualización
git checkout -b chore/update-dependencies

# Actualizar package.json
npm update
npm audit fix

# Commit y push
git add package*.json
git commit -m "chore: update npm dependencies"
git push -u origin chore/update-dependencies
```

### Integración Continua

El proyecto tiene configurados workflows de GitHub Actions para:

- **Linting** - Verificación de estilo de código
- **Testing** - Ejecución de tests automatizados
- **Build** - Construcción del proyecto
- **Deploy** - Despliegue automático (si está configurado)

### Resolución de Conflictos

```bash
# Si hay conflictos durante merge/rebase
git status                    # Ver archivos en conflicto
# Editar archivos manualmente para resolver conflictos
git add archivo-resuelto.js  # Marcar como resuelto
git commit                   # Completar el merge

# Para abortar un merge problemático
git merge --abort
```

### Tagging y Releases

```bash
# Crear tag para release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Listar tags
git tag -l

# Ver información de un tag
git show v1.0.0
```

### Buenas Prácticas

1. **Commits pequeños y frecuentes** - Es mejor hacer muchos commits pequeños que pocos grandes
2. **Mensajes descriptivos** - Los futuros desarrolladores (incluyéndote a ti) te lo agradecerán
3. **Revisar antes de commitear** - Usa `git diff` antes de `git add`
4. **Mantener ramas actualizadas** - Regularmente haz `git pull origin develop`
5. **No hacer force push a ramas compartidas** - Usa `--force-with-lease` si es absolutamente necesario
6. **Probar antes de pushear** - Asegúrate que el código funciona antes de subirlo

### Comandos de Emergencia

```bash
# Deshacer último commit (manteniendo cambios)
git reset HEAD~1

# Deshacer último commit (perdiendo cambios)
git reset --hard HEAD~1

# Recuperar archivo eliminado
git checkout HEAD -- archivo.js

# Ver quién modificó cada línea
git blame archivo.js

# Buscar en el historial
git log --grep="búsqueda"
git log -p -S "búsqueda en código"
```

## Estado Actual del Proyecto

**Última actualización:** 3 de julio de 2025

**Rama actual:** `main`
**Commits pendientes de push:** 3 commits ahead of origin/main

**Últimos cambios importantes:**
- ✅ Modelos actualizados para coincidir con esquema de BD
- ✅ Eliminado modelo GenreCategory obsoleto
- ✅ Corregidos tipos de datos en CharacterSandwichRating
- ✅ Documentación README.md completamente actualizada

**Próximos pasos recomendados:**
1. `git push origin main` - Subir cambios pendientes
2. Merge de cambios a `develop` si es necesario
3. Continuar desarrollo en ramas feature específicas