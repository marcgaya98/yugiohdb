---
applyTo: "tests/*.js"
---
# Instrucciones para tests automáticos (Jest)

- Todos los tests deben estar en la carpeta `tests/` y usar extensión `.js`.
- Usar sintaxis ESM (`import`/`export`) y helpers de Jest desde `@jest/globals`.
- Cada archivo de test debe probar una sola unidad funcional (modelo, controlador, etc).
- Incluir comentarios descriptivos para cada bloque de pruebas (`describe`) y cada caso (`it`).
- Usar nombres de test claros y en español.
- Limpiar los datos de prueba en `afterAll` o `afterEach` para evitar contaminación entre tests.
- Usar `beforeAll` para preparar el entorno si es necesario (por ejemplo, sincronizar la base de datos).
- Evitar dependencias entre tests: cada test debe ser independiente.
- Usar aserciones explícitas (`expect`) y evitar aserciones implícitas.
- Si se testean errores, usar `await expect(...).rejects.toThrow()`.
- Si se testea integración con la base de datos, cerrar conexiones al final del test suite.
- Mantener los tests rápidos y legibles, siguiendo principios de Clean Code.
- Si se requiere mocking, usar las utilidades de Jest para ESM (`jest.unstable_mockModule`).
- Documentar el propósito del archivo y cada bloque relevante.

## Ejemplo de estructura profesional:
```js
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import MiModelo from '../models/MiModelo.js';

describe('MiModelo', () => {
  beforeAll(async () => {
    // Preparar entorno
  });

  afterAll(async () => {
    // Limpiar entorno
  });

  it('debe hacer algo esperado', async () => {
    // ...
    expect(...).toBe(...);
  });
});
```
