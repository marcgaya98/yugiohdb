# Flujo de trabajo Git para YuGiOh DB

Este proyecto sigue un modelo de ramificación basado en [GitFlow](https://nvie.com/posts/a-successful-git-branching-model/) adaptado a nuestras necesidades específicas.

## Ramas principales

- **main**: Contiene código estable y listo para producción. Solo se fusionan cambios desde `develop` o ramas de hotfix.
- **develop**: Rama de integración para nuevas características. Todas las características completas se fusionan aquí.

## Ramas de soporte

- **feature/nombre-caracteristica**: Para desarrollar nuevas características. Se ramifican desde `develop` y se fusionan de vuelta a `develop`.
- **bugfix/nombre-bug**: Para correcciones de errores que irán en la siguiente versión. Se ramifican desde `develop`.
- **hotfix/nombre-hotfix**: Para correcciones urgentes en producción. Se ramifican desde `main` y se fusionan tanto a `main` como a `develop`.
- **release/X.Y.Z**: Para preparar una nueva versión. Se ramifican desde `develop` y se fusionan a `main` y `develop`.

## Flujo de trabajo

### Para nuevas características:

1. Actualizar la rama `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Crear una nueva rama para la característica:
   ```bash
   git checkout -b feature/nombre-caracteristica
   ```

3. Hacer commits con mensajes descriptivos siguiendo el formato de [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: añadir nueva funcionalidad de búsqueda"
   ```

4. Subir la rama al repositorio remoto:
   ```bash
   git push origin feature/nombre-caracteristica
   ```

5. Crear un Pull Request hacia `develop`.

### Para correcciones de errores:

1. Para bugs en desarrollo:
   ```bash
   git checkout -b bugfix/nombre-bug develop
   ```

2. Para bugs en producción:
   ```bash
   git checkout -b hotfix/nombre-bug main
   ```

3. Hacer commits con mensajes descriptivos:
   ```bash
   git commit -m "fix: corregir error en la consulta de cartas"
   ```

## Convenciones para mensajes de commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nueva característica
- `fix:` - Corrección de error
- `docs:` - Solo afecta a la documentación
- `style:` - Cambios de formato (espacios, indentación, etc.)
- `refactor:` - Refactorización del código
- `test:` - Añade o modifica tests
- `chore:` - Tareas rutinarias, cambios en el proceso de construcción, etc.
- `ci:` - Cambios en la integración continua

## Proceso de publicación

1. Crear una rama `release/X.Y.Z` desde `develop`.
2. Actualizar versión en package.json y CHANGELOG.md.
3. Realizar pruebas finales y correcciones menores.
4. Fusionar a `main` y etiquetar con la versión.
5. Fusionar de vuelta a `develop`.

## Gestión de etiquetas (tags)

Seguimos [Semantic Versioning](https://semver.org/):

- `X.Y.Z` donde:
  - `X` es la versión mayor (cambios incompatibles)
  - `Y` es la versión menor (nuevas características compatibles)
  - `Z` es la versión de parche (correcciones compatibles)
