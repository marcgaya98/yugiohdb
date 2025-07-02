# Actualización de Game Stats API

## Resumen de Cambios

Se han unificado los controladores y rutas relacionados con las estadísticas del juego:
- Bonus (bonificaciones)
- Challenge (desafíos)
- HighScore (récords)

Estos tres componentes ahora forman parte de un único controlador llamado `GameStatsController` 
y sus rutas están disponibles a través del prefijo `/api/game-stats/`.

## Nuevas rutas

### Bonus
- GET `/api/game-stats/bonus` - Obtener todas las bonificaciones
- GET `/api/game-stats/bonus/:id` - Obtener bonificación por ID
- GET `/api/game-stats/bonus/category/:category` - Obtener bonificaciones por categoría

### Challenge
- GET `/api/game-stats/challenge` - Obtener todos los desafíos
- GET `/api/game-stats/challenge/:id` - Obtener desafío por ID
- GET `/api/game-stats/challenge/category/:category` - Obtener desafíos por categoría

### High Score
- GET `/api/game-stats/high-score` - Obtener todos los high scores
- GET `/api/game-stats/high-score/:id` - Obtener high score por ID
- GET `/api/game-stats/high-score/category/:category` - Obtener high scores por categoría

## Archivos afectados

- Nuevo: `/controllers/GameStatsController.js`
- Nuevo: `/routes/gameStatsRoutes.js`
- Modificado: `/routes/index.js`

## Archivos que pueden ser eliminados (deprecated)

Estos archivos ya no son necesarios pero se mantienen temporalmente para referencia:

- `/controllers/BonusController.js`
- `/controllers/ChallengeController.js`
- `/controllers/HighScoreController.js`
- `/routes/bonusRoutes.js`
- `/routes/challengeRoutes.js`
- `/routes/highScoreRoutes.js`

Serán eliminados en una futura actualización cuando se confirme el correcto funcionamiento de la nueva estructura.
