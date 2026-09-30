/**
 * DTOs de la API de estadísticas: validan la entrada HTTP y dan forma a la salida.
 * Mantienen el contrato (openapi/openapi.yaml) separado del dominio.
 */
const AppError = require('../errors/AppError');

const MAX_NAME_LENGTH = 50;

const invalid = (message) => new AppError(400, 'INVALID_MATRIX', message);

/**
 * @typedef {object} StatisticsRequestLimits
 * @property {number} maxMatrices Máximo de matrices por petición.
 * @property {number} matrixMaxDimension Máximo de filas y de columnas por matriz.
 */

/**
 * Valida el cuerpo de POST /api/v1/statistics y lo convierte en matrices del dominio.
 * `name` es opcional: si falta se asigna "M1", "M2", ... según su posición.
 *
 * @param {unknown} body Cuerpo JSON recibido.
 * @param {StatisticsRequestLimits} limits Límites configurados.
 * @returns {import('../domain/matrixStatistics').NamedMatrix[]}
 * @throws {AppError} 400 INVALID_MATRIX con el primer problema encontrado.
 */
function parseStatisticsRequest(body, { maxMatrices, matrixMaxDimension }) {
  // * Frontera de confianza: todo lo que entra por HTTP se valida aquí antes de llegar al dominio.
  // ! Los límites (cantidad y tamaño) evitan que un cuerpo enorme consuma CPU del servicio.
  const matrices = body && body.matrices;
  if (!Array.isArray(matrices) || matrices.length === 0) {
    throw invalid('"matrices" debe ser un array con al menos una matriz');
  }
  if (matrices.length > maxMatrices) {
    throw invalid(`se aceptan como máximo ${maxMatrices} matrices por petición`);
  }

  return matrices.map((item, index) => {
    const label = `matrices[${index}]`;
    if (!item || typeof item !== 'object') throw invalid(`${label} debe ser un objeto { name, values }`);

    const name = item.name === undefined ? `M${index + 1}` : item.name;
    if (typeof name !== 'string' || name.trim() === '' || name.length > MAX_NAME_LENGTH) {
      throw invalid(`${label}.name debe ser un texto de 1 a ${MAX_NAME_LENGTH} caracteres`);
    }

    return { name, values: validateValues(item.values, `${label}.values`, matrixMaxDimension) };
  });
}

/**
 * Valida que `values` sea una matriz rectangular no vacía de números finitos.
 * @returns {number[][]}
 */
function validateValues(values, label, maxDimension) {
  if (!Array.isArray(values) || values.length === 0) {
    throw invalid(`${label} debe ser un array de filas no vacío`);
  }
  if (!Array.isArray(values[0]) || values[0].length === 0) {
    throw invalid(`${label} debe tener filas no vacías`);
  }

  const cols = values[0].length;
  if (values.length > maxDimension || cols > maxDimension) {
    throw invalid(`${label} excede el tamaño máximo de ${maxDimension}x${maxDimension}`);
  }

  values.forEach((row, i) => {
    if (!Array.isArray(row) || row.length !== cols) {
      throw invalid(`${label} debe ser rectangular: la fila ${i} no tiene ${cols} columnas`);
    }
    row.forEach((v, j) => {
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        throw invalid(`${label}[${i}][${j}] debe ser un número finito`);
      }
    });
  });
  return values;
}

/**
 * Da forma a la respuesta pública (contrato estable aunque cambie el dominio).
 *
 * @param {import('../domain/matrixStatistics').MatrixStatistics} stats
 */
function toStatisticsResponse(stats) {
  return {
    max: stats.max,
    min: stats.min,
    average: stats.average,
    sum: stats.sum,
    count: stats.count,
    anyDiagonal: stats.anyDiagonal,
    matrices: stats.matrices.map(({ name, isDiagonal }) => ({ name, isDiagonal })),
  };
}

module.exports = { parseStatisticsRequest, toStatisticsResponse };
