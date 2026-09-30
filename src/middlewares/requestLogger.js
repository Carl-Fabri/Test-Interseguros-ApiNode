/**
 * Logging estructurado (JSON) de cada petición con pino-http, apto para servicios de logs en la nube.
 */
const { randomUUID } = require('node:crypto');
const pinoHttp = require('pino-http');

/**
 * @param {string} level Nivel de log ("silent" desactiva los logs, p. ej. en pruebas).
 * @returns {import('express').RequestHandler}
 */
function requestLogger(level) {
  return pinoHttp({
    level,
    // Reutiliza el X-Request-ID entrante (trazabilidad entre servicios) o genera uno nuevo.
    genReqId: (req, res) => {
      const id = req.headers['x-request-id'] || randomUUID();
      res.setHeader('X-Request-ID', id);
      return id;
    },
    // ! Nunca registrar el token: aparece como [Redacted] en los logs.
    redact: ['req.headers.authorization'],
  });
}

module.exports = { requestLogger };
