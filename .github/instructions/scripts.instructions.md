---
applyTo: "**/scripts/*.js"
---
# Instrucciones para scripts

- Incluir documentación detallada al inicio del archivo
- Implementar manejo de errores robusto
- Crear clases o funciones modulares
- Para scripts de descarga/procesamiento de imágenes:
  - Utilizar normalizePasswordForUrl de utils/passwordUtils.js
  - Procesar en lotes para evitar sobrecarga
  - Implementar reintentos para operaciones de red
  - Mostrar progreso claro en consola
- Para scripts de importación/migración:
  - Validar integridad de datos
  - Implementar transacciones cuando sea necesario
  - Incluir opción para rollback o dry-run