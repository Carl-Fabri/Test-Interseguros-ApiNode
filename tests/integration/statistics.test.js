const request = require('supertest');
const { createApp } = require('../../src/app');
const { testConfig, signToken } = require('../helpers/testConfig');

const app = createApp(testConfig);
const ENDPOINT = '/api/v1/statistics';

/** Q y R de la QR de [[2,0],[0,3]]: ambas diagonales. */
const qrOfDiagonal = {
  matrices: [
    { name: 'Q', values: [[1, 0], [0, 1]] },
    { name: 'R', values: [[2, 0], [0, 3]] },
  ],
};

describe(`POST ${ENDPOINT}`, () => {
  describe('con un token válido', () => {
    const token = signToken();

    it('devuelve las estadísticas de todas las matrices', async () => {
      const res = await request(app).post(ENDPOINT).set('Authorization', `Bearer ${token}`).send({
        matrices: [
          { name: 'Q', values: [[0.6, -0.8], [0.8, 0.6]] },
          { name: 'R', values: [[5, 1], [0, 2]] },
        ],
      });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ max: 5, min: -0.8, count: 8, anyDiagonal: false });
      expect(res.body.sum).toBeCloseTo(9.2);
      expect(res.body.average).toBeCloseTo(1.15);
      expect(res.body.matrices).toEqual([
        { name: 'Q', isDiagonal: false },
        { name: 'R', isDiagonal: false },
      ]);
    });

    it('detecta matrices diagonales', async () => {
      const res = await request(app).post(ENDPOINT).set('Authorization', `Bearer ${token}`).send(qrOfDiagonal);

      expect(res.status).toBe(200);
      expect(res.body.anyDiagonal).toBe(true);
      expect(res.body.matrices.every((m) => m.isDiagonal)).toBe(true);
    });

    it.each([
      ['matrices inválidas', { matrices: [{ values: [[1, 2], [3]] }] }, 400, 'INVALID_MATRIX'],
      ['sin matrices', {}, 400, 'INVALID_MATRIX'],
    ])('rechaza %s', async (_, body, status, code) => {
      const res = await request(app).post(ENDPOINT).set('Authorization', `Bearer ${token}`).send(body);

      expect(res.status).toBe(status);
      expect(res.body.error.code).toBe(code);
    });

    it('rechaza JSON mal formado con 400 INVALID_REQUEST', async () => {
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{"matrices":');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_REQUEST');
    });

    it('rechaza cuerpos que exceden el límite con 413', async () => {
      const big = { matrices: [{ values: [Array(20000).fill(1)] }] };
      const res = await request(app).post(ENDPOINT).set('Authorization', `Bearer ${token}`).send(big);

      expect(res.status).toBe(413);
      expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    });
  });

  describe('seguridad JWT', () => {
    it.each([
      ['sin header Authorization', undefined],
      ['esquema distinto de Bearer', `Basic ${signToken()}`],
      ['token mal formado', 'Bearer abc.def.ghi'],
      ['firmado con otro secreto', `Bearer ${signToken({ secret: 'x'.repeat(32) })}`],
      ['emisor distinto', `Bearer ${signToken({ issuer: 'otro' })}`],
      ['audiencia distinta', `Bearer ${signToken({ audience: 'otra' })}`],
      ['expirado', `Bearer ${signToken({ expiresIn: -10 })}`],
      ['algoritmo distinto (HS512)', `Bearer ${signToken({ algorithm: 'HS512' })}`],
    ])('rechaza con 401: %s', async (_, authorization) => {
      const req = request(app).post(ENDPOINT).send(qrOfDiagonal);
      if (authorization) req.set('Authorization', authorization);
      const res = await req;

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
