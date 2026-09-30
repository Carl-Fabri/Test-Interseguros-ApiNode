/**
 * Middlewares de errores: 404 para rutas desconocidas y traducción de cualquier error al
 * formato único `{ error: { code, message } }`. En Express 5 los errores lanzados en
 * handlers (síncronos o async) llegan aquí sin necesidad de `next(err)`.
 */
const AppError = require('../errors/AppError');

/** @type {import('express').RequestHandler} */
function notFound(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', 'recurso no encontrado'));
}

/**
 * Traduce errores de body-parser (express.json) a AppError.
 * @param {any} err
 */
function fromBodyParser(err) {
  if (err.type === 'entity.parse.failed') {
    return new AppError(400, 'INVALID_REQUEST', 'el cuerpo no es un JSON válido');
  }
  if (err.type === 'entity.too.large') {
    return new AppError(413, 'PAYLOAD_TOO_LARGE', 'el cuerpo excede el tamaño máximo permitido');
  }
  return null;
}

/** @type {import('express').ErrorRequestHandler} */
// eslint-disable-next-line no-unused-vars -- Express identifica el error handler por sus 4 parámetros
function errorHandler(err, req, res, next) {
  // * Único lugar que traduce errores a HTTP: AppError → su código; body-parser → 400/413; resto → 500.
  const appError = err instanceof AppError ? err : fromBodyParser(err);

  if (!appError) {
    // ! Nunca exponer el detalle interno al cliente (stack traces, rutas); queda en el log.
    (req.log || console).error({ err }, 'error no controlado');
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'error interno del servidor' } });
  }

  return res.status(appError.statusCode).json({ error: { code: appError.code, message: appError.message } });
}

module.exports = { notFound, errorHandler };
