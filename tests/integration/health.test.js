const request = require('supertest');
const { createApp } = require('../../src/app');
const { testConfig } = require('../helpers/testConfig');

const app = createApp(testConfig);

describe('rutas públicas', () => {
  it('GET /health responde 200 sin token', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'api-node' });
  });

  it('GET /openapi.yaml sirve el contrato', async () => {
    const res = await request(app).get('/openapi.yaml');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/yaml');
    expect(res.text).toContain('openapi: 3.1.0');
  });

  it('GET /docs sirve la referencia de Scalar', async () => {
    const res = await request(app).get('/docs');

    expect(res.status).toBe(200);
    expect(res.text).toContain('@scalar/api-reference');
  });

  it('responde 404 con el formato de error estándar', async () => {
    const res = await request(app).get('/no-existe');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: 'NOT_FOUND', message: 'recurso no encontrado' } });
  });

  it('permite CORS al frontend configurado', async () => {
    const res = await request(app).options('/api/v1/statistics').set('Origin', 'http://localhost:4200');

    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:4200');
  });
});
