# Research: Estadísticas de matrices

**Feature**: `001-estadisticas-matrices` | **Date**: 2026-09-29

## R1. Cálculo en una sola pasada

- **Decision**: bucles `for` que actualizan máximo, mínimo, suma, conteo y bandera de diagonalidad en el mismo recorrido.
- **Rationale**: O(N) en tiempo y O(1) de memoria extra por matriz; evita `flat()`/`reduce()` encadenados que crean
  arrays intermedios y recorren los datos varias veces.
- **Alternatives considered**: `Math.max(...values.flat())` (desborda la pila de argumentos con matrices grandes y
  hace varias pasadas); librerías numéricas (mathjs): dependencia innecesaria para cinco agregados.

## R2. Definición de matriz diagonal

- **Decision**: definición rectangular (i ≠ j → 0) con tolerancia absoluta `DIAGONAL_TOLERANCE` (1e-10).
- **Rationale**: R de la QR es m×n; la definición cuadrada estricta la descartaría siempre en matrices altas. La
  tolerancia absorbe el ruido de coma flotante (≈ 1e-17) sin confundir valores reales.
- **Alternatives considered**: solo matrices cuadradas (contradice el caso de uso principal); tolerancia relativa a
  la norma (más robusta para magnitudes extremas; documentada como mejora futura).

## R3. Validación de entrada

- **Decision**: DTO con validación manual y mensajes que indican la posición del error (`matrices[0].values[1][2]`).
- **Rationale**: pocas reglas, sin dependencias y con mensajes precisos para el cliente.
- **Alternatives considered**: zod/joi (útiles con muchos esquemas; aquí añadirían una dependencia por un solo DTO).

## R4. Validación del JWT

- **Decision**: `jsonwebtoken.verify` con `algorithms: ['HS256']`, `issuer`, `audience` y verificación explícita de `exp`.
- **Rationale**: misma política que api-go; `jsonwebtoken` acepta tokens sin `exp` por defecto, por eso se exige a mano.
- **Alternatives considered**: `express-jwt` (envoltorio adicional sin beneficio real para una sola ruta).

## R5. Documentación con Scalar

- **Decision**: página standalone de Scalar (CDN con versión fijada) montada antes de helmet.
- **Rationale**: `@scalar/express-api-reference` solo publica ESM y el proyecto es CommonJS con Jest; la CSP de
  helmet bloquearía el script externo en `/docs`.
