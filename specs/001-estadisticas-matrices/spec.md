# Feature Specification: Estadísticas de matrices

**Feature Branch**: `001-estadisticas-matrices`

**Created**: 2026-09-29

**Status**: Implemented

**Input**: User description: "API en Node.js que reciba el resultado de las matrices devueltas por la primera API y calcule: valor máximo, valor mínimo, promedio, suma total y verificar si alguna matriz es diagonal. Proteger las consultas con JWT."

## Clarifications

### Session 2026-09-29

- Q: ¿Las estadísticas son por matriz o sobre todas las matrices juntas? → A: Máximo, mínimo, promedio y suma sobre **todos** los valores de todas las matrices; la diagonalidad se informa **por matriz** y agregada (`anyDiagonal`).
- Q: ¿Qué es una "matriz diagonal" si la matriz no es cuadrada (R es m×n)? → A: Se acepta la definición rectangular: todos los elementos con i ≠ j valen cero. Una matriz 1×1 o nula es diagonal.
- Q: ¿Cómo tratar el error de coma flotante de la QR (p. ej. 1e-17)? → A: Tolerancia absoluta configurable `DIAGONAL_TOLERANCE`, 1e-10 por defecto.
- Q: ¿Solo lo consume api-go? → A: No: cualquier cliente con un JWT válido (el frontend también lo llama directo). El nombre de cada matriz es opcional.
- Q: ¿Qué token acepta? → A: El JWT HS256 que emite api-go, con el mismo secreto, emisor y audiencia.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Calcular estadísticas de un conjunto de matrices (Priority: P1)

Un cliente autenticado envía una o más matrices y recibe el valor máximo, mínimo, promedio, suma total y cantidad de
valores considerando todas ellas.

**Why this priority**: es la operación adicional central del reto.

**Independent Test**: con `Q=[[1,0],[0,1]]` y `R=[[2,3],[0,4]]` la respuesta es max 4, min 0, sum 11, count 8, average 1.375.

**Acceptance Scenarios**:

1. **Given** varias matrices válidas, **When** se envían, **Then** max/min/sum/count/average se calculan sobre todos los valores.
2. **Given** una sola matriz de un valor negativo, **When** se envía, **Then** max = min = sum = average = ese valor y count = 1.

---

### User Story 2 - Detectar si alguna matriz es diagonal (Priority: P1)

La respuesta indica, para cada matriz, si es diagonal y si al menos una lo es.

**Why this priority**: es parte explícita de la operación adicional.

**Independent Test**: Q = I y R diagonal → ambas `isDiagonal: true` y `anyDiagonal: true`; R triangular con valores sobre la diagonal → `false`.

**Acceptance Scenarios**:

1. **Given** una matriz con todos los elementos fuera de la diagonal en cero, **When** se evalúa, **Then** `isDiagonal: true`.
2. **Given** ruido de coma flotante (≤ tolerancia) fuera de la diagonal, **When** se evalúa, **Then** se considera diagonal.
3. **Given** una matriz rectangular con ceros fuera de la diagonal (p. ej. R 3×2), **When** se evalúa, **Then** `isDiagonal: true`.

---

### User Story 3 - Proteger y validar la API (Priority: P1)

Solo clientes con un JWT válido de api-go pueden consultar, y las entradas inválidas se rechazan con mensajes claros.

**Why this priority**: requisito de seguridad del reto y protección del servicio.

**Independent Test**: sin token, con token expirado, de otro emisor/audiencia, otro secreto u otro algoritmo → 401; cuerpo inválido → 400; cuerpo excesivo → 413.

**Acceptance Scenarios**:

1. **Given** un token válido de api-go, **When** se consulta, **Then** 200.
2. **Given** un token inválido por cualquier motivo, **When** se consulta, **Then** 401 `UNAUTHORIZED`.
3. **Given** matrices vacías, no rectangulares, con valores no numéricos o fuera de límites, **When** se consulta, **Then** 400 `INVALID_MATRIX`.
4. **Given** JSON mal formado, **When** se consulta, **Then** 400 `INVALID_REQUEST`; cuerpo mayor que `BODY_LIMIT` → 413 `PAYLOAD_TOO_LARGE`.

### Edge Cases

- `null`, strings, `NaN` o `Infinity` como valores → 400.
- Más de `MAX_MATRICES` matrices o dimensiones mayores a `MATRIX_MAX_DIMENSION` → 400.
- Nombre de matriz ausente → se asigna `M1`, `M2`, ...; nombre vacío o > 50 caracteres → 400.
- Token sin `exp` → 401 (jsonwebtoken lo aceptaría por defecto; se exige explícitamente).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST aceptar de 1 a `MAX_MATRICES` matrices `{ name?, values }`.
- **FR-002**: El sistema MUST calcular máximo, mínimo, suma, cantidad y promedio sobre todos los valores.
- **FR-003**: El sistema MUST indicar por matriz si es diagonal (i ≠ j → |a_ij| ≤ tolerancia) y si alguna lo es.
- **FR-004**: El cálculo MUST recorrer cada valor una sola vez.
- **FR-005**: El sistema MUST validar las matrices (no vacías, rectangulares, finitas, dentro de límites) y responder 400.
- **FR-006**: Todo endpoint de negocio MUST exigir un JWT HS256 válido con `iss`, `aud` y `exp` coincidentes con api-go.
- **FR-007**: Los errores MUST usar el formato único con códigos estables.
- **FR-008**: El contrato MUST publicarse en OpenAPI con referencia interactiva.

### Key Entities

- **Matriz con nombre**: identificador opcional y valores m×n.
- **Estadísticas**: max, min, average, sum, count, anyDiagonal y resultado por matriz.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Resultados exactos (o con tolerancia 1e-9 en flotantes) en el 100 % de los casos de prueba.
- **SC-002**: 10 matrices de 100×100 se procesan en menos de 20 ms en el servidor.
- **SC-003**: El 100 % de las peticiones sin token válido se rechazan con 401.
- **SC-004**: Cobertura de pruebas ≥ 95 %.

## Assumptions

- El JWT lo emite api-go; api-node solo lo valida (no tiene login propio).
- No se persisten matrices ni resultados.
- La tolerancia absoluta es adecuada para las magnitudes del reto; una tolerancia relativa queda como mejora.
