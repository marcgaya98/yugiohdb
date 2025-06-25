# Contribuir al proyecto YuGiOh DB

¡Gracias por tu interés en contribuir a YuGiOh DB! Este documento proporciona lineamientos para contribuir a este proyecto.

## Proceso de contribución

1. Crea un fork del repositorio
2. Clona tu fork: `git clone https://github.com/TU_USUARIO/yugiohdb.git`
3. Crea una rama para tu contribución: `git checkout -b feature/nueva-caracteristica`
4. Realiza tus cambios siguiendo las convenciones del código
5. Asegúrate de que los tests pasen (si existen)
6. Haz commit de tus cambios con mensajes descriptivos:
   ```
   git commit -m "feat: añade soporte para X"
   ```
7. Sube los cambios a tu fork: `git push origin feature/nueva-caracteristica`
8. Crea un Pull Request al repositorio original

## Convenciones para commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/) para los mensajes de commit:

- `feat:` para nuevas características
- `fix:` para correcciones de bugs
- `docs:` para cambios en la documentación
- `style:` para cambios que no afectan el significado del código
- `refactor:` para cambios de código que no corrigen ni añaden características
- `test:` para añadir tests o corregir tests existentes
- `chore:` para cambios en el proceso de build o herramientas auxiliares

## Estructura del código

- Mantén los archivos relacionados juntos en directorios apropiados
- Sigue las convenciones de nomenclatura del proyecto:
  - PascalCase para modelos y clases
  - camelCase para variables, funciones y métodos
  - kebab-case para archivos estáticos

## Normas de codificación

- Sigue el estilo de código establecido (ESLint y Prettier ya están configurados)
- Escribe comentarios claros para código complejo
- No incluyas código comentado
- Documenta las nuevas APIs o cambios significativos

## Reportando problemas

Al reportar un problema, incluye:

- Una descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado vs. comportamiento actual
- Capturas de pantalla si son relevantes
- Tu entorno (sistema operativo, navegador, etc.)

## Preguntas

Si tienes preguntas sobre el desarrollo o contribución, por favor abre un issue con la etiqueta "pregunta".

¡Gracias por contribuir!
