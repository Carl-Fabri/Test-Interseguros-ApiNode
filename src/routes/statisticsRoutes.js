/**
 * Rutas de estadísticas (montadas bajo /api/v1). Todas protegidas con JWT.
 */
const express = require('express');

/**
 * @param {{ auth: import('express').RequestHandler, controller: ReturnType<typeof import('../controllers/statisticsController').createStatisticsController> }} deps
 */
function statisticsRoutes({ auth, controller }) {
  const router = express.Router();
  router.post('/statistics', auth, controller.compute);
  return router;
}

module.exports = { statisticsRoutes };
