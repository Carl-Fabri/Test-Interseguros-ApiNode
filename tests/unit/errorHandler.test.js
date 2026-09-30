const { errorHandler } = require('../../src/middlewares/errorHandler');
const AppError = require('../../src/errors/AppError');

/** Respuesta Express mínima que registra status y body. */
function mockResponse() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('errorHandler', () => {
  it('traduce un AppError a su código HTTP y formato estándar', () => {
    const res = mockResponse();
    errorHandler(new AppError(400, 'INVALID_MATRIX', 'mal'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: { code: 'INVALID_MATRIX', message: 'mal' } });
  });

  it('responde 500 sin exponer el detalle de un error inesperado y lo registra', () => {
    const res = mockResponse();
    const log = { error: jest.fn() };
    errorHandler(new Error('conexión a secreto fallida'), { log }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: { code: 'INTERNAL_ERROR', message: 'error interno del servidor' } });
    expect(log.error).toHaveBeenCalled();
  });
});
