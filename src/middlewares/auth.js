/**
 * Middleware JWT: exige `Authorization: Bearer <token>` firmado por api-go (HS256)
 * con el emisor y la audiencia configurados, y con expiración.
 */
const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');

/**
 * @param {Pick<import('../config').Config, 'jwtSecret' | 'jwtIssuer' | 'jwtAudience'>} options
 * @returns {import('express').RequestHandler}
 */
function requireJwt({ jwtSecret, jwtIssuer, jwtAudience }) {
  return (req, res, next) => {
    const [scheme, token] = (req.get('Authorization') || '').split(' ');
    if (!/^Bearer$/i.test(scheme || '') || !token) {
      throw new AppError(401, 'UNAUTHORIZED', 'se requiere un token Bearer en el header Authorization');
    }

    let payload;
    try {
      // ! Mismo secreto, emisor y audiencia que api-go: el token que emite api-go es el que se valida aquí.
      payload = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'], // fija el algoritmo: evita ataques de "alg: none" o de confusión de algoritmo
        issuer: jwtIssuer,
        audience: jwtAudience,
      });
    } catch {
      throw new AppError(401, 'UNAUTHORIZED', 'token inválido o expirado');
    }
    // ! jsonwebtoken acepta tokens SIN exp: se exige explícitamente para que ningún token sea eterno.
    if (typeof payload.exp !== 'number') {
      throw new AppError(401, 'UNAUTHORIZED', 'token inválido o expirado');
    }

    req.user = { subject: payload.sub };
    next();
  };
}

module.exports = { requireJwt };
