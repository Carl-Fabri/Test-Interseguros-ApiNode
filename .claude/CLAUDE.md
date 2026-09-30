# api-node — API de estadísticas (Node.js + Express 5)

> **Servicio autónomo.** No forma parte de un monolito: tiene su propio código, configuración,
> imagen Docker, pruebas y despliegue. Funciona por sí solo, sin el resto del repositorio.

## Responsabilidad
Recibir matrices (en el flujo principal, Q y R de api-go) y calcular en **una sola pasada**: valor máximo,
valor mínimo, promedio, suma total, cantidad de valores y si alguna matriz es diagonal.

## Límites del servicio
- No conoce a api-go: expone su API según el contrato `openapi/openapi.yaml` y la puede consumir
  cualquier cliente con un JWT válido emitido por api-go. Nunca leer ni importar código de `../api-go`.
- Toda la configuración entra por variables de entorno (`src/config`), sin valores fijos en el código.

## Endpoints (contrato: `openapi/openapi.yaml`)
| Método | Ruta                  | Auth | Descripción                                   |
|--------|-----------------------|------|-----------------------------------------------|
| GET    | `/health`             | No   | Estado del servicio                           |
| GET    | `/docs`               | No   | Referencia interactiva (Scalar)               |
| GET    | `/openapi.yaml`       | No   | Contrato OpenAPI 3.1                          |
| POST   | `/api/v1/statistics`  | JWT  | Estadísticas de 1 a `MAX_MATRICES` matrices   |

## Arquitectura (Clean Architecture; las dependencias apuntan hacia el dominio)
```
src/server.js        Punto de entrada: loadConfig, listen y apagado ordenado
src/app.js           Raíz de composición: createApp(config), middlewares y rutas (sin listen, para supertest)
src/config/          loadConfig(env): valores por defecto y validación
src/domain/          Núcleo puro: computeStatistics(matrices, tolerance)
src/dtos/            parseStatisticsRequest (validación → 400 INVALID_MATRIX) y toStatisticsResponse
src/services/        createStatisticsService(config): DTO + dominio, sin req/res
src/controllers/     createStatisticsController(service): adapta req/res
src/routes/          statisticsRoutes({ auth, controller }) y docsRoutes (Scalar + openapi.yaml)
src/middlewares/     requireJwt, errorHandler + notFound, requestLogger (pino-http, token redactado)
src/errors/          AppError(statusCode, code, message)
openapi/             openapi.yaml y docs.html (Scalar)
tests/unit/          Dominio, DTO, config, error handler
tests/integration/   Endpoints con supertest; helpers en tests/helpers/testConfig.js
deploy/aws/          service.yml (CloudFormation ECS Fargate) + deploy.sh (build → ECR → stack)
```

## Convenciones
- CommonJS (`require`/`module.exports`) con fábricas e inyección de dependencias (sin singletons).
- `domain/` y `services/` no dependen de Express. Los errores HTTP se traducen solo en `middlewares/errorHandler.js`.
- Express 5: los errores lanzados en handlers (sync o async) llegan solos al error handler.
- `/docs` se monta antes de `helmet` porque Scalar carga su script desde un CDN.
- JSDoc en funciones públicas. Flotantes con `toBeCloseTo` en pruebas.

## Comentarios (Better Comments)
En los métodos clave: `// *` punto clave · `// !` advertencia o seguridad · `// ?` decisión de diseño · `// TODO:` pendiente.
La documentación de la API pública sigue siendo api-node.

## SDD (Spec Kit)
Cada funcionalidad se especifica antes de implementarse: `.specify/memory/constitution.md` (principios) y
`specs/NNN-funcionalidad/` (spec, plan, research, data-model, contracts, quickstart, tasks y checklists).
Comandos: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.

## Definición de terminado (OBLIGATORIA en cada cambio)
Ningún cambio está terminado hasta cumplir **los tres puntos**. Si alguno no aplica, decirlo explícitamente en el resumen.
1. **Pruebas**: agregar o actualizar pruebas unitarias (`tests/unit/`) de toda lógica nueva o modificada, y de
   integración (`tests/integration/`) si cambia un endpoint. Un bug corregido lleva una prueba que lo reproduce.
   `npm test` en verde.
2. **Documentación**: JSDoc de funciones públicas, este `CLAUDE.md` (estructura, comandos y variables), `README.md` y,
   si cambia la API, el contrato en `openapi/openapi.yaml`.
3. **Docker**: revisar y actualizar si hace falta `Dockerfile`, `docker-compose.yml`, `.env.example` y `.dockerignore`
   cuando cambien dependencias, variables de entorno, puertos, archivos que la imagen necesita o pasos de build.
   Validar con `docker compose build`.
   Si cambia una variable de entorno, un puerto o el health check, actualizar también `deploy/aws/service.yml`
   (y validar con `cfn-lint`). Guía: `docs/deploy/aws.md`.

El CI (`.github/workflows/ci.yml`) bloquea el cambio si fallan las pruebas unitarias, las de integración
o el build de la imagen.

## Comandos (desde `api-node/`)
- Ejecutar: `npm start` / desarrollo con recarga: `npm run dev` (ambos cargan `.env` con `--env-file-if-exists`)
- Pruebas: `npm test` (`npm run test:unit`, `npm run test:integration`, `npm test -- --coverage`)
- Docker aislado: `docker compose up --build`
- Despliegue en AWS: `./deploy/aws/deploy.sh` (crea la plataforma compartida si falta)

## Variables de entorno (ver `.env.example`)
| Variable               | Default               | Descripción                                          |
|------------------------|-----------------------|------------------------------------------------------|
| `PORT`                 | 3000                  | Puerto HTTP                                          |
| `JWT_SECRET`           | — (obligatoria, ≥ 32) | Secreto HS256, **igual al de api-go**                |
| `JWT_ISSUER`           | api-go                | Claim `iss` esperado                                 |
| `JWT_AUDIENCE`         | matrix-services       | Claim `aud` esperado                                 |
| `CORS_ALLOWED_ORIGINS` | http://localhost:4200 | Orígenes permitidos, separados por coma              |
| `DIAGONAL_TOLERANCE`   | 1e-10                 | Valor absoluto bajo el cual un número cuenta como 0  |
| `MATRIX_MAX_DIMENSION` | 100                   | Máximo de filas y columnas por matriz                |
| `MAX_MATRICES`         | 10                    | Máximo de matrices por petición                      |
| `BODY_LIMIT`           | 1mb                   | Tamaño máximo del cuerpo JSON                        |
| `LOG_LEVEL`            | info (silent en test) | Nivel de log de pino                                 |

## Agentes, skills y memoria
- **Subagentes** (`.claude/agents/`, con memoria persistente en `.claude/agent-memory/<nombre>/`):
  - `node-api-developer`: implementa tareas o specs con TDD. Delegarle el código de producción y sus pruebas.
  - `node-api-reviewer`: revisa sin editar (estadísticas, matriz diagonal, JWT, contrato, pruebas). Usarlo tras cada funcionalidad.
- **Skills**: `express-endpoint` (propia), de addyosmani `api-and-interface-design`, `security-and-hardening` y
  `test-driven-development` (sus ejemplos están en TS: adaptarlos a JS CommonJS), y `speckit-*` (Spec Kit, flujo SDD).
  Versiones de terceros fijadas en `skills-lock.json`.
- **Reglas por ruta**: `.claude/rules/testing.md` se carga solo al tocar pruebas.
- **Dónde guardar cada cosa**: regla permanente → este archivo o `.claude/rules/`; decisión o contrato →
  `docs/architecture/` o `openapi/openapi.yaml`; contexto o preferencia que no se deduce del código → memoria. Al cerrar: `/retro`.
