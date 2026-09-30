const { loadConfig } = require('../../src/config');

const SECRET = 's'.repeat(32);

describe('loadConfig', () => {
  it('aplica valores por defecto con solo JWT_SECRET', () => {
    expect(loadConfig({ JWT_SECRET: SECRET })).toEqual({
      port: 3000,
      jwtSecret: SECRET,
      jwtIssuer: 'api-go',
      jwtAudience: 'matrix-services',
      corsAllowedOrigins: ['http://localhost:4200'],
      diagonalTolerance: 1e-10,
      matrixMaxDimension: 100,
      maxMatrices: 10,
      bodyLimit: '1mb',
      logLevel: 'info',
    });
  });

  it('lee overrides y normaliza la lista de orígenes', () => {
    const config = loadConfig({
      JWT_SECRET: SECRET,
      PORT: '4000',
      CORS_ALLOWED_ORIGINS: 'http://a.com, ,http://b.com',
      DIAGONAL_TOLERANCE: '1e-6',
      NODE_ENV: 'test',
    });
    expect(config.port).toBe(4000);
    expect(config.corsAllowedOrigins).toEqual(['http://a.com', 'http://b.com']);
    expect(config.diagonalTolerance).toBe(1e-6);
    expect(config.logLevel).toBe('silent');
  });

  it('exige un JWT_SECRET de al menos 32 caracteres', () => {
    expect(() => loadConfig({ JWT_SECRET: 'corto' })).toThrow('JWT_SECRET');
    expect(() => loadConfig({})).toThrow('JWT_SECRET');
  });

  it.each([
    ['PORT', 'abc'],
    ['PORT', '0'],
    ['PORT', '3.5'],
    ['MATRIX_MAX_DIMENSION', '-1'],
    ['DIAGONAL_TOLERANCE', 'x'],
  ])('rechaza %s inválido "%s"', (key, value) => {
    expect(() => loadConfig({ JWT_SECRET: SECRET, [key]: value })).toThrow(key);
  });

  it('reporta todos los errores juntos', () => {
    expect(() => loadConfig({ PORT: 'abc' })).toThrow(/PORT[\s\S]*JWT_SECRET/);
  });
});
