const { computeStatistics } = require('../../src/domain/matrixStatistics');

const TOL = 1e-10;

describe('computeStatistics', () => {
  it('calcula máximo, mínimo, promedio, suma y conteo sobre todas las matrices', () => {
    const stats = computeStatistics(
      [
        { name: 'A', values: [[1, 2], [3, 4]] },
        { name: 'B', values: [[-5, 10, 0]] },
      ],
      TOL,
    );

    expect(stats.max).toBe(10);
    expect(stats.min).toBe(-5);
    expect(stats.sum).toBe(15);
    expect(stats.count).toBe(7);
    expect(stats.average).toBeCloseTo(15 / 7);
  });

  it('detecta qué matrices son diagonales y si alguna lo es', () => {
    const stats = computeStatistics(
      [
        { name: 'diagonal', values: [[2, 0], [0, 3]] },
        { name: 'no-diagonal', values: [[1, 2], [0, 3]] },
      ],
      TOL,
    );

    expect(stats.anyDiagonal).toBe(true);
    expect(stats.matrices).toEqual([
      { name: 'diagonal', isDiagonal: true },
      { name: 'no-diagonal', isDiagonal: false },
    ]);
  });

  it('informa anyDiagonal=false cuando ninguna es diagonal', () => {
    const stats = computeStatistics([{ name: 'A', values: [[1, 1], [1, 1]] }], TOL);
    expect(stats.anyDiagonal).toBe(false);
  });

  it.each([
    ['1x1', [[7]], true],
    ['nula', [[0, 0], [0, 0]], true],
    ['rectangular diagonal (R de una QR 3x2)', [[5, 0], [0, 2], [0, 0]], true],
    ['rectangular no diagonal', [[5, 1], [0, 2], [0, 0]], false],
    ['ruido de coma flotante bajo la tolerancia', [[1, 1e-17], [-2e-16, 1]], true],
    ['valor fuera de la diagonal sobre la tolerancia', [[1, 1e-6], [0, 1]], false],
  ])('diagonalidad: %s', (_, values, expected) => {
    expect(computeStatistics([{ name: 'M', values }], TOL).matrices[0].isDiagonal).toBe(expected);
  });

  it('funciona con matrices de un solo valor negativo', () => {
    const stats = computeStatistics([{ name: 'M', values: [[-3]] }], TOL);
    expect(stats).toMatchObject({ max: -3, min: -3, sum: -3, average: -3, count: 1 });
  });
});
