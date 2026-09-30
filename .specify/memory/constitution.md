<!--
Sync Impact Report
- Version change: plantilla → 1.0.0 (ratificación inicial)
- Principios definidos: I. Servicio autónomo · II. Contrato primero · III. Dominio puro y arquitectura limpia ·
  IV. Pruebas primero · V. Seguridad por defecto · VI. Simplicidad y costo mínimo
- Secciones agregadas: Restricciones técnicas · Flujo de desarrollo (SDD) · Gobierno
- Plantillas revisadas: ✅ plan-template.md (Constitution Check) · ✅ spec-template.md · ✅ tasks-template.md
- Pendientes: ninguno
-->

# Constitución de api-node

## Core Principles

### I. Servicio autónomo
api-node es un servicio independiente con su propio repositorio, código, configuración, imagen Docker, pruebas, CI y
despliegue. **No conoce a sus clientes**: expone su API según su contrato y la puede consumir cualquier cliente con un
JWT válido (api-go o el frontend). No comparte código con otros servicios.

### II. Contrato primero (NON-NEGOTIABLE)
Toda API pública se define en `openapi/openapi.yaml` **antes** de implementarse y se actualiza en el mismo cambio que
la modifica. Errores con formato único `{"error": {"code", "message"}}` y códigos estables. Un cambio incompatible
exige una nueva versión de ruta (`/api/v2`).

### III. Dominio puro y arquitectura limpia
`domain` (cálculo puro) ← `services` (casos de uso) ← `dtos` (validación y forma de salida) ← `controllers`/`routes`/
`middlewares` (Express). Fábricas con inyección de dependencias, sin singletons. `domain` y `services` **no dependen
de Express**. Los errores se traducen a HTTP en un único middleware.

### IV. Pruebas primero (NON-NEGOTIABLE)
Se trabaja con TDD: la prueba que falla se escribe antes que el código. Toda lógica tiene pruebas unitarias (Jest) y
todo endpoint pruebas de integración (supertest) que cubran casos límite, errores y seguridad. Los flotantes se
comparan con tolerancia. El CI bloquea el cambio si fallan las pruebas o el build de la imagen.

### V. Seguridad por defecto
Toda ruta de negocio exige JWT HS256 (algoritmo fijo, `iss`, `aud` y `exp` obligatorios) emitido por api-go. Secretos
solo por variables de entorno o Secrets Manager; el servicio no arranca con un secreto de menos de 32 caracteres.
Límites de tamaño de cuerpo y de matrices, cabeceras de seguridad (helmet), token redactado en los logs y errores
internos nunca expuestos.

### VI. Simplicidad y costo mínimo
Soluciones simples (YAGNI) y eficientes (una sola pasada sobre los datos). Cada dependencia nueva se justifica. En la
nube, recursos compartidos, Fargate Spot y CI sin despliegues automáticos.

## Restricciones técnicas

- **Lenguaje y framework:** Node.js 22 LTS, Express 5, JavaScript CommonJS con JSDoc.
- **Contenedor:** Dockerfile multi-stage, solo dependencias de producción, usuario `node`, `HEALTHCHECK`.
- **Configuración:** solo variables de entorno validadas al arrancar (`src/config`).
- **Observabilidad:** logs JSON estructurados (pino-http) con `X-Request-ID`.
- **Despliegue:** AWS ECS Fargate con CloudFormation (`deploy/aws/`), detrás del ALB compartido.

## Flujo de desarrollo (SDD)

1. `/speckit-specify` → `specs/NNN-funcionalidad/spec.md`.
2. `/speckit-clarify` → resolver ambigüedades (p. ej. la definición de "matriz diagonal").
3. `/speckit-plan` → `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` (Constitution Check).
4. `/speckit-tasks` → `tasks.md` por historia de usuario, pruebas primero.
5. `/speckit-implement` → implementación hasta que todas las pruebas pasan.
6. **Definición de terminado:** pruebas, documentación (JSDoc, README, contrato) y Docker/despliegue actualizados.

## Governance

Esta constitución prevalece sobre cualquier otra práctica del repositorio. Todo `plan.md` debe pasar el Constitution
Check; las violaciones solo se aceptan documentadas en "Complexity Tracking". Enmiendas con versionado semántico
(MAJOR/MINOR/PATCH) reflejadas en las plantillas. Guía operativa: `.claude/CLAUDE.md`.

**Version**: 1.0.0 | **Ratified**: 2026-09-29 | **Last Amended**: 2026-09-30
