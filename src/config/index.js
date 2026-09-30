/**
 * Carga y valida la configuración de api-node desde variables de entorno.
 */

/** Longitud mínima del secreto HS256 (256 bits), igual que en api-go. */
const MIN_JWT_SECRET_LENGTH = 32;

/**
 * @typedef {object} Config
 * @property {number} port Puerto HTTP.
 * @property {string} jwtSecret Secreto compartido con api-go para validar JWT (HS256).
 * @property {string} jwtIssuer Claim "iss" esperado.
 * @property {string} jwtAudience Claim "aud" esperado.
 * @property {string[]} corsAllowedOrigins Orígenes permitidos (p. ej. el frontend).
 * @property {number} diagonalTolerance Valor absoluto bajo el cual un número se considera cero.
 * @property {number} matrixMaxDimension Máximo de filas y de columnas por matriz.
 * @property {number} maxMatrices Máximo de matrices por petición.
 * @property {string} bodyLimit Tamaño máximo del cuerpo JSON (formato de express.json).
 * @property {string} logLevel Nivel de log de pino ("silent" en pruebas).
 */

/**
 * Lee la configuración de `env`, aplica valores por defecto y valida los obligatorios.
 *
 * @param {NodeJS.ProcessEnv} [env=process.env] Fuente de variables (inyectable para pruebas).
 * @returns {Config}
 * @throws {Error} Con todos los problemas encontrados, uno por línea.
 */
function loadConfig(env = process.env) {
  const errors = [];
  const value = (key, fallback) => {
    const raw = env[key] === undefined ? '' : String(env[key]).trim();
    return raw === '' ? fallback : raw;
  };
  const positiveInt = (key, fallback) => {
    const raw = value(key, undefined);
    if (raw === undefined) return fallback;
    const n = Number(raw);
    if (!Number.isInteger(n) || n <= 0) {
      errors.push(`${key} debe ser un entero positivo: "${raw}"`);
      return fallback;
    }
    return n;
  };
  const positiveNumber = (key, fallback) => {
    const raw = value(key, undefined);
    if (raw === undefined) return fallback;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      errors.push(`${key} debe ser un número positivo: "${raw}"`);
      return fallback;
    }
    return n;
  };

  const config = {
    port: positiveInt('PORT', 3000),
    jwtSecret: env.JWT_SECRET || '',
    jwtIssuer: value('JWT_ISSUER', 'api-go'),
    jwtAudience: value('JWT_AUDIENCE', 'matrix-services'),
    corsAllowedOrigins: value('CORS_ALLOWED_ORIGINS', 'http://localhost:4200')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    diagonalTolerance: positiveNumber('DIAGONAL_TOLERANCE', 1e-10),
    matrixMaxDimension: positiveInt('MATRIX_MAX_DIMENSION', 100),
    maxMatrices: positiveInt('MAX_MATRICES', 10),
    bodyLimit: value('BODY_LIMIT', '1mb'),
    logLevel: value('LOG_LEVEL', env.NODE_ENV === 'test' ? 'silent' : 'info'),
  };

  // ! Fallar al arrancar con un secreto débil es preferible a aceptar tokens fáciles de forjar.
  if (config.jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
    errors.push(`JWT_SECRET es obligatorio y debe tener al menos ${MIN_JWT_SECRET_LENGTH} caracteres`);
  }

  if (errors.length > 0) {
    throw new Error(`Configuración inválida:\n- ${errors.join('\n- ')}`);
  }
  return config;
}

module.exports = { loadConfig };
