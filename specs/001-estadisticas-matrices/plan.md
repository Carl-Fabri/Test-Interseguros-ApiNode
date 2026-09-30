# Implementation Plan: Estadísticas de matrices

**Branch**: `001-estadisticas-matrices` | **Date**: 2026-09-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-estadisticas-matrices/spec.md`

## Summary

`POST /api/v1/statistics` valida el JWT de api-go (`jsonwebtoken`, HS256 fijo, `iss`/`aud`/`exp`), valida las
matrices en un DTO y delega en `computeStatistics`, que en **una sola pasada** calcula máximo, mínimo, suma, conteo y
diagonalidad con tolerancia. Arquitectura por capas con fábricas e inyección de dependencias; errores traducidos a
HTTP en un único middleware.

## Technical Context

**Language/Version**: Node.js 22 LTS (JavaScript CommonJS + JSDoc)

**Primary Dependencies**: Express 5, jsonwebtoken, helmet, cors, pino-http

**Storage**: N/A

**Testing**: Jest (unitarias) + supertest (integración)

**Target Platform**: contenedor Linux (node:22-alpine) en Docker y AWS ECS Fargate

**Project Type**: web-service (API REST)

**Performance Goals**: O(N) sobre el total de valores; 10 × 100×100 en < 20 ms

**Constraints**: `BODY_LIMIT` 1 MB, `MAX_MATRICES` 10, `MATRIX_MAX_DIMENSION` 100

**Scale/Scope**: sin estado; una petición = un conjunto de matrices

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Servicio autónomo | ✅ No conoce a api-go: solo valida el token con el secreto compartido |
| II. Contrato primero | ✅ `StatisticsRequest`, `StatisticsResponse` y errores en `openapi/openapi.yaml` |
| III. Dominio puro | ✅ `computeStatistics` sin Express ni configuración; fábricas `createX(config)` |
| IV. Pruebas primero | ✅ TDD: dominio, DTO, config y error handler unitarios; endpoints y JWT con supertest |
| V. Seguridad por defecto | ✅ JWT estricto, límites, helmet, token redactado, errores internos ocultos |
| VI. Simplicidad | ✅ validación manual en el DTO (sin librería de esquemas); una pasada O(N) |

**Resultado**: aprobado sin violaciones (re-verificado tras la fase 1).

## Project Structure

### Documentation (this feature)

```text
specs/001-estadisticas-matrices/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/
├── checklists/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── domain/matrixStatistics.js      computeStatistics (una pasada)
├── dtos/statisticsDto.js           parseStatisticsRequest · toStatisticsResponse
├── services/statisticsService.js   createStatisticsService(config)
├── controllers/statisticsController.js
├── routes/statisticsRoutes.js · routes/docsRoutes.js
├── middlewares/auth.js · errorHandler.js · requestLogger.js
├── errors/AppError.js
├── config/index.js                 loadConfig(env)
├── app.js                          createApp(config)
└── server.js
openapi/openapi.yaml · openapi/docs.html
tests/unit/ · tests/integration/ · tests/helpers/testConfig.js
```

**Structure Decision**: servicio único por capas (constitución, principio III); la matemática aislada en `domain`
para probarla sin HTTP.

## Complexity Tracking

Sin violaciones de la constitución.
