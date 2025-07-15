---
applyTo: "**/controllers/*.js"
---
# Instrucciones para controladores

- Organizar métodos por funcionalidad con comentarios de separación
- Usar async/await para todas las operaciones de base de datos
- Estructurar respuestas consistentemente: { status, message, data }
- Implementar manejo de errores con try/catch
- Devolver códigos HTTP apropiados (200, 201, 400, 404, 500, etc.)
- Utilizar destructuring para parámetros de solicitud
- Validar entradas antes de operaciones en base de datos
- Para endpoints de colecciones, incluir paginación y filtrado

## Ejemplo de estructura de método:
```js
/**
 * Descripción del método
 */
async methodName(req, res) {
  try {
    const { param1, param2 } = req.params;
    // Validación
    // Lógica principal
    return res.status(200).json({
      message: 'Mensaje de éxito',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error message',
      error: error.message
    });
  }
}
```