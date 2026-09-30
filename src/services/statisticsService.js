/**
 * Caso de uso de estadísticas: valida la entrada con el DTO, delega el cálculo en el
 * dominio y devuelve la respuesta pública. No conoce Express (no recibe req ni res).
 */
const { computeStatistics } = require('../domain/matrixStatistics');
const { parseStatisticsRequest, toStatisticsResponse } = require('../dtos/statisticsDto');

/**
 * @param {Pick<import('../config').Config, 'diagonalTolerance' | 'maxMatrices' | 'matrixMaxDimension'>} options
 */
function createStatisticsService({ diagonalTolerance, maxMatrices, matrixMaxDimension }) {
  return {
    /**
     * Calcula las estadísticas de las matrices recibidas.
     *
     * @param {unknown} body Cuerpo de la petición.
     * @returns {ReturnType<typeof toStatisticsResponse>}
     * @throws {import('../errors/AppError')} 400 si la entrada es inválida.
     */
    compute(body) {
      const matrices = parseStatisticsRequest(body, { maxMatrices, matrixMaxDimension });
      return toStatisticsResponse(computeStatistics(matrices, diagonalTolerance));
    },
  };
}

module.exports = { createStatisticsService };
