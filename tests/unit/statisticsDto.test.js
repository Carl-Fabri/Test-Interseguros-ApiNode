const { parseStatisticsRequest, toStatisticsResponse } = require('../../src/dtos/statisticsDto');
const AppError = require('../../src/errors/AppError');

const limits = { maxMatrices: 2, matrixMaxDimension: 3 };

describe('parseStatisticsRequest', () => {
  it('acepta matrices válidas y asigna nombres por defecto', () => {
    const parsed = parseStatisticsRequest({ matrices: [{ name: 'Q', values: [[1]] }, { values: [[2, 3]] }] }, limits);
    expect(parsed).toEqual([
      { name: 'Q', values: [[1]] },
      { name: 'M2', values: [[2, 3]] },
    ]);
  });

  it.each([
    ['body ausente', undefined, '"matrices"'],
    ['matrices no es array', { matrices: {} }, '"matrices"'],
    ['matrices vacío', { matrices: [] }, '"matrices"'],
    ['demasiadas matrices', { matrices: [{ values: [[1]] }, { values: [[1]] }, { values: [[1]] }] }, 'máximo 2'],
    ['elemento no objeto', { matrices: [5] }, 'objeto'],
    ['name vacío', { matrices: [{ name: ' ', values: [[1]] }] }, '.name'],
    ['name no texto', { matrices: [{ name: 3, values: [[1]] }] }, '.name'],
    ['values ausente', { matrices: [{ name: 'A' }] }, 'array de filas'],
    ['fila vacía', { matrices: [{ values: [[]] }] }, 'filas no vacías'],
    ['no rectangular', { matrices: [{ values: [[1, 2], [3]] }] }, 'rectangular'],
    ['valor no numérico', { matrices: [{ values: [[1, '2']] }] }, 'número finito'],
    ['valor null', { matrices: [{ values: [[null]] }] }, 'número finito'],
    ['excede el tamaño máximo', { matrices: [{ values: [[1, 2, 3, 4]] }] }, 'tamaño máximo'],
  ])('rechaza %s con 400 INVALID_MATRIX', (_, body, messagePart) => {
    let error;
    try {
      parseStatisticsRequest(body, limits);
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ statusCode: 400, code: 'INVALID_MATRIX' });
    expect(error.message).toContain(messagePart);
  });
});

describe('toStatisticsResponse', () => {
  it('expone solo los campos del contrato', () => {
    const response = toStatisticsResponse({
      max: 1, min: 0, average: 0.5, sum: 1, count: 2, anyDiagonal: true,
      matrices: [{ name: 'Q', isDiagonal: true, interno: 'x' }],
      interno: 'x',
    });
    expect(response).toEqual({
      max: 1, min: 0, average: 0.5, sum: 1, count: 2, anyDiagonal: true,
      matrices: [{ name: 'Q', isDiagonal: true }],
    });
  });
});
