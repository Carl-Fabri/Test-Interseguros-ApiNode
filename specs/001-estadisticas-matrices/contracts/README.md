# Contratos: Estadísticas de matrices

Fuente de verdad: [`openapi/openapi.yaml`](../../../openapi/openapi.yaml) (en vivo: `GET /openapi.yaml`, referencia en `/docs`).

| Método | Ruta | Seguridad | Respuestas |
|---|---|---|---|
| GET | `/health` | Pública | 200 `{status:"ok", service:"api-node"}` |
| POST | `/api/v1/statistics` | `bearerAuth` (JWT de api-go) | 200 `StatisticsResponse` · 400 `INVALID_REQUEST`/`INVALID_MATRIX` · 401 `UNAUTHORIZED` · 413 `PAYLOAD_TOO_LARGE` |

```http
POST /api/v1/statistics
Authorization: Bearer <JWT emitido por api-go>
Content-Type: application/json

{ "matrices": [ { "name": "Q", "values": [[1,0],[0,1]] }, { "name": "R", "values": [[2,3],[0,4]] } ] }
```
```json
{ "max": 4, "min": 0, "average": 1.375, "sum": 11, "count": 8, "anyDiagonal": true,
  "matrices": [{ "name": "Q", "isDiagonal": true }, { "name": "R", "isDiagonal": false }] }
```

Consumidores conocidos: api-go (envía Q y R) y matrix-web (envía A, Q y R por separado). El contrato no depende de ellos.
