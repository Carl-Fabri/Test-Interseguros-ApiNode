# Data Model: Estadísticas de matrices

**Feature**: `001-estadisticas-matrices`

## StatisticsRequest (DTO de entrada)

| Campo | Tipo | Reglas |
|---|---|---|
| `matrices` | array | 1 a `MAX_MATRICES` (10) elementos |
| `matrices[i].name` | string (opcional) | 1–50 caracteres; por defecto `M{i+1}` |
| `matrices[i].values` | number[][] | No vacía, rectangular, finita, ≤ `MATRIX_MAX_DIMENSION` (100) filas y columnas |

## NamedMatrix (dominio)

`{ name: string, values: number[][] }`, ya validada por el DTO.

## MatrixStatistics / StatisticsResponse

| Campo | Tipo | Cálculo |
|---|---|---|
| `max` | number | Mayor valor de todas las matrices |
| `min` | number | Menor valor de todas las matrices |
| `sum` | number | Suma de todos los valores |
| `count` | integer | Cantidad total de valores |
| `average` | number | `sum / count` |
| `anyDiagonal` | boolean | `true` si alguna matriz es diagonal |
| `matrices` | `[{ name, isDiagonal }]` | Resultado por matriz, en el orden recibido |

## Configuración relevante

| Variable | Default | Uso |
|---|---|---|
| `DIAGONAL_TOLERANCE` | 1e-10 | Umbral de "cero" para la diagonalidad |
| `MAX_MATRICES` | 10 | Límite de matrices por petición |
| `MATRIX_MAX_DIMENSION` | 100 | Límite de filas y columnas |
| `BODY_LIMIT` | 1mb | Tamaño máximo del cuerpo |
| `JWT_SECRET` / `JWT_ISSUER` / `JWT_AUDIENCE` | — / api-go / matrix-services | Validación del token |
