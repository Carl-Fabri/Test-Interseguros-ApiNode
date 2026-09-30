/**
 * Controller HTTP de estadísticas: adapta la petición Express al caso de uso.
 */

/**
 * @param {ReturnType<typeof import('../services/statisticsService').createStatisticsService>} statisticsService
 */
function createStatisticsController(statisticsService) {
  return {
    /**
     * POST /api/v1/statistics
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    compute(req, res) {
      res.json(statisticsService.compute(req.body));
    },
  };
}

module.exports = { createStatisticsController };
