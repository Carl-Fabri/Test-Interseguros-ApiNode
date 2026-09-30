/**
 * Raíz de composición de api-node: construye las dependencias y la app Express sin
 * levantar el servidor, para poder reutilizarla en pruebas de integración con supertest.
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { requestLogger } = require('./middlewares/requestLogger');
const { requireJwt } = require('./middlewares/auth');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { createStatisticsService } = require('./services/statisticsService');
const { createStatisticsController } = require('./controllers/statisticsController');
const { statisticsRoutes } = require('./routes/statisticsRoutes');
const { docsRoutes } = require('./routes/docsRoutes');

/**
 * @param {import('./config').Config} config
 * @returns {import('express').Express}
 */
function createApp(config) {
  const app = express();
  app.disable('x-powered-by');

  const controller = createStatisticsController(createStatisticsService(config));

  // * Middlewares transversales (el orden importa):
  // *   logger → CORS → docs (antes de helmet) → helmet → JSON → rutas → 404 → errores.
  app.use(requestLogger(config.logLevel));
  app.use(
    cors({
      origin: config.corsAllowedOrigins,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type'],
    }),
  );

  // ? Documentación antes de helmet: la CSP de helmet bloquearía el script de Scalar servido desde un CDN.
  app.use(docsRoutes());

  app.use(helmet());
  app.use(express.json({ limit: config.bodyLimit }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-node' });
  });

  // ! Rutas de negocio siempre detrás de requireJwt.
  app.use('/api/v1', statisticsRoutes({ auth: requireJwt(config), controller }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
