/**
 * Error de aplicación con código HTTP y código estable, traducido por el middleware de errores
 * al formato único `{ error: { code, message } }`.
 */
class AppError extends Error {
  /**
   * @param {number} statusCode Código HTTP.
   * @param {string} code Código estable legible por máquinas (p. ej. "INVALID_MATRIX").
   * @param {string} message Mensaje legible por personas.
   */
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = AppError;
