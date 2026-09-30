/**
 * Configuración y tokens de prueba. Nunca se usa el .env real.
 */
const jwt = require('jsonwebtoken');

const TEST_SECRET = 't'.repeat(32);

/** @type {import('../../src/config').Config} */
const testConfig = {
  port: 0,
  jwtSecret: TEST_SECRET,
  jwtIssuer: 'api-go',
  jwtAudience: 'matrix-services',
  corsAllowedOrigins: ['http://localhost:4200'],
  diagonalTolerance: 1e-10,
  matrixMaxDimension: 10,
  maxMatrices: 3,
  bodyLimit: '10kb',
  logLevel: 'silent',
};

/**
 * Firma un token como lo haría api-go. `overrides` permite probar tokens inválidos.
 * @param {{ secret?: string, algorithm?: import('jsonwebtoken').Algorithm } & import('jsonwebtoken').SignOptions} [overrides]
 */
function signToken({ secret = TEST_SECRET, ...options } = {}) {
  return jwt.sign({ sub: 'admin' }, secret, {
    algorithm: 'HS256',
    issuer: 'api-go',
    audience: 'matrix-services',
    expiresIn: '1h',
    ...options,
  });
}

module.exports = { testConfig, signToken, TEST_SECRET };
