---

description: "Lista de tareas de la funcionalidad Estadísticas de matrices"
---

# Tasks: Estadísticas de matrices

**Input**: Design documents from `/specs/001-estadisticas-matrices/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: obligatorios por constitución (principio IV, TDD): cada prueba se escribe y falla antes de implementar.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Instalar express, jsonwebtoken, helmet, cors y pino-http; jest y supertest como dependencias de desarrollo en package.json
- [x] T002 [P] Definir `/api/v1/statistics`, esquemas y errores en openapi/openapi.yaml
- [x] T003 [P] Agregar las variables (JWT_*, DIAGONAL_TOLERANCE, MAX_MATRICES, MATRIX_MAX_DIMENSION, BODY_LIMIT, LOG_LEVEL) a .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T004 [P] Pruebas de configuración (valores por defecto, overrides, secreto débil, errores juntos) en tests/unit/config.test.js
- [x] T005 Implementar loadConfig(env) en src/config/index.js
- [x] T006 [P] Pruebas del error handler (AppError y 500 sin detalles) en tests/unit/errorHandler.test.js
- [x] T007 Implementar AppError, errorHandler y notFound en src/errors/AppError.js y src/middlewares/errorHandler.js
- [x] T008 Implementar createApp(config) con logger (token redactado), CORS, helmet y límite de cuerpo en src/app.js

**Checkpoint**: aplicación base con errores uniformes.

---

## Phase 3: User Story 1 - Calcular estadísticas de un conjunto de matrices (Priority: P1) 🎯 MVP

**Goal**: max, min, sum, count y average sobre todas las matrices.

**Independent Test**: Q=I y R=[[2,3],[0,4]] → max 4, min 0, sum 11, count 8, average 1.375.

### Tests for User Story 1

- [x] T009 [P] [US1] Pruebas de agregados (varias matrices, valor único negativo) en tests/unit/matrixStatistics.test.js
- [x] T010 [P] [US1] Prueba de integración del camino feliz en tests/integration/statistics.test.js

### Implementation for User Story 1

- [x] T011 [US1] Implementar computeStatistics en una sola pasada en src/domain/matrixStatistics.js
- [x] T012 [US1] Implementar createStatisticsService, el controller y la ruta en src/services/, src/controllers/ y src/routes/

---

## Phase 4: User Story 2 - Detectar si alguna matriz es diagonal (Priority: P1)

**Goal**: diagonalidad por matriz y agregada, con tolerancia.

**Independent Test**: matrices diagonales, rectangulares y con ruido de coma flotante se clasifican correctamente.

### Tests for User Story 2

- [x] T013 [P] [US2] Pruebas de diagonalidad (1×1, nula, rectangular, ruido ≤ tolerancia, valor > tolerancia) en tests/unit/matrixStatistics.test.js
- [x] T014 [P] [US2] Prueba de integración con Q y R diagonales en tests/integration/statistics.test.js

### Implementation for User Story 2

- [x] T015 [US2] Agregar la bandera isDiagonal (i ≠ j, |v| ≤ tolerancia) al mismo recorrido en src/domain/matrixStatistics.js
- [x] T016 [US2] Exponer `anyDiagonal` y `matrices[]` en toStatisticsResponse (src/dtos/statisticsDto.js)

---

## Phase 5: User Story 3 - Proteger y validar la API (Priority: P1)

**Goal**: JWT obligatorio y entradas validadas.

**Independent Test**: los 8 casos de token inválido → 401; entradas inválidas → 400; cuerpo excesivo → 413.

### Tests for User Story 3

- [x] T017 [P] [US3] Pruebas del DTO (13 casos de entrada inválida y nombres por defecto) en tests/unit/statisticsDto.test.js
- [x] T018 [P] [US3] Pruebas de JWT (sin header, otro esquema, mal formado, otro secreto, emisor, audiencia, expirado, HS512) en tests/integration/statistics.test.js
- [x] T019 [P] [US3] Pruebas de JSON mal formado (400) y cuerpo excesivo (413) en tests/integration/statistics.test.js

### Implementation for User Story 3

- [x] T020 [US3] Implementar parseStatisticsRequest con mensajes por posición en src/dtos/statisticsDto.js
- [x] T021 [US3] Implementar requireJwt (HS256 fijo, iss, aud, exp obligatorio) en src/middlewares/auth.js
- [x] T022 [US3] Traducir errores de body-parser a 400/413 en src/middlewares/errorHandler.js

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T023 [P] Servir /openapi.yaml y /docs (Scalar) antes de helmet en src/routes/docsRoutes.js
- [x] T024 [P] Dockerfile multi-stage con usuario node y HEALTHCHECK; docker-compose.yml
- [x] T025 [P] Pila de despliegue con JWT_SECRET desde Secrets Manager en deploy/aws/service.yml
- [x] T026 [P] Documentar en README.md, .claude/CLAUDE.md y docs/architecture/ADR-002
- [x] T027 Ejecutar quickstart.md y `npm test -- --coverage` (cobertura ≈ 99 %)

## Dependencies & Execution Order

- Setup → Foundational → US1 → US2 → US3 → Polish.
- US2 extiende el recorrido de US1; US3 puede desarrollarse en paralelo a US2 (archivos distintos).
