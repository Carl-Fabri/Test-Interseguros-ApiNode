---
name: express-endpoint
description: Convenciones de api-node para crear o modificar endpoints con Express 5 en CommonJS (ruta, controller, service, middleware, errores y pruebas con Jest y supertest). Usar al agregar rutas, controllers, services o middlewares.
---

# Endpoints con Express 5 en api-node

> El proyecto usa **JavaScript en CommonJS** (`require` y `module.exports`), no TypeScript.
> Si otra skill muestra ejemplos en TS, adaptarlos a JS con JSDoc.

## Flujo por capas (en este orden)
1. **Contrato**: confirmar el endpoint en `openapi/openapi.yaml`. Si no existe, detenerse y pedir que se defina.
2. **Dominio** en `src/domain/`: matemática pura, sin validación HTTP ni configuración.
3. **DTO** en `src/dtos/`: valida el cuerpo (lanza `AppError(400, 'INVALID_MATRIX', ...)`) y da forma a la respuesta pública.
4. **Service** en `src/services/`: fábrica `createXService(config)` que usa DTO + dominio, **sin `req` ni `res`**.
5. **Controller** en `src/controllers/`: fábrica que recibe el service y adapta `req`/`res`.
6. **Route** en `src/routes/`: fábrica que recibe `{ auth, controller }`; se monta en `createApp(config)` bajo `/api/v1`.
7. **Pruebas**: unitarias de dominio y DTO en `tests/unit/`; integración con supertest sobre `createApp(testConfig)`
   (`tests/helpers/testConfig.js`, que también firma tokens con `signToken()`).

## Express 5: puntos clave
- Los errores lanzados en handlers `async` llegan solos al middleware de errores (no hace falta `try/catch` ni `next(err)`).
- Middleware de errores único en `src/middlewares/errorHandler.js`, registrado al final de `app.js`, con formato:
  `{ "error": { "code": "INVALID_MATRIX", "message": "..." } }`.
- Errores de dominio: clase `AppError(statusCode, code, message)`; el error handler la traduce.
- `app.js` exporta `createApp(config)` **sin** `listen`; solo `server.js` carga `loadConfig()` y levanta el puerto.

## Esqueleto
```js
// src/controllers/statisticsController.js (patrón real del proyecto: fábricas con dependencias inyectadas)
function createStatisticsController(statisticsService) {
  return {
    /** POST /api/v1/statistics */
    compute(req, res) {
      res.json(statisticsService.compute(req.body)); // el service lanza AppError si la entrada es inválida
    },
  };
}

module.exports = { createStatisticsController };
```

```js
// tests/integration/stats.test.js
const request = require('supertest');
const { createApp } = require('../../src/app');
const { testConfig, signToken } = require('../helpers/testConfig');

const app = createApp(testConfig);

describe('POST /api/v1/stats', () => {
  it('rechaza un body sin matrices', async () => {
    const res = await request(app).post('/api/v1/stats').set('Authorization', `Bearer ${signToken()}`).send({});
    expect(res.status).toBe(400);
  });
});
```

## Checklist antes de terminar
- [ ] Pruebas unitarias nuevas o actualizadas; `npm test` en verde
- [ ] JSDoc en funciones públicas de services y controllers; `.claude/CLAUDE.md` y `README.md` al día
- [ ] Sin valores fijos: todo lo configurable sale de `src/config/`
- [ ] El contrato en `openapi/openapi.yaml` coincide con lo implementado
- [ ] Docker revisado: `Dockerfile`, `docker-compose.yml`, `.env.example` si cambiaron dependencias, variables o puertos
