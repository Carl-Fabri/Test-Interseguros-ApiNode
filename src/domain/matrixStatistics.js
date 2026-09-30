/**
 * Núcleo matemático de api-node: estadísticas sobre un conjunto de matrices.
 * Funciones puras, sin dependencias de Express ni de la configuración.
 */

/**
 * @typedef {object} NamedMatrix
 * @property {string} name Identificador de la matriz (p. ej. "Q" o "R").
 * @property {number[][]} values Matriz rectangular en orden de filas, ya validada.
 */

/**
 * @typedef {object} MatrixStatistics
 * @property {number} max Valor máximo de todas las matrices.
 * @property {number} min Valor mínimo de todas las matrices.
 * @property {number} average Promedio de todos los valores.
 * @property {number} sum Suma total de todos los valores.
 * @property {number} count Cantidad total de valores.
 * @property {boolean} anyDiagonal true si alguna matriz es diagonal.
 * @property {{ name: string, isDiagonal: boolean }[]} matrices Resultado por matriz.
 */

/**
 * Calcula máximo, mínimo, promedio, suma y diagonalidad en **una sola pasada** sobre los
 * datos (O(N) en tiempo, O(1) de memoria adicional por matriz).
 *
 * Diagonal: una matriz es diagonal si todos sus elementos fuera de la diagonal principal
 * (i ≠ j) valen cero, con tolerancia `tolerance` para absorber el error de coma flotante
 * de la QR (p. ej. 1e-17 en lugar de 0). Se admite la definición rectangular (m×n), porque
 * R es m×n; una matriz de 1×1 o nula es diagonal por definición.
 *
 * @param {NamedMatrix[]} matrices Al menos una matriz no vacía.
 * @param {number} tolerance Valor absoluto bajo el cual un número se considera cero.
 * @returns {MatrixStatistics}
 */
function computeStatistics(matrices, tolerance) {
  // * Método central del servicio: un solo recorrido calcula todo (máx, mín, suma, conteo y diagonalidad).
  // ? Bucles for clásicos en lugar de flat()/reduce(): no crean arrays intermedios en matrices de 100×100.
  let max = -Infinity;
  let min = Infinity;
  let sum = 0;
  let count = 0;

  const perMatrix = matrices.map(({ name, values }) => {
    let isDiagonal = true;

    for (let i = 0; i < values.length; i += 1) {
      const row = values[i];
      for (let j = 0; j < row.length; j += 1) {
        const v = row[j];
        if (v > max) max = v;
        if (v < min) min = v;
        sum += v;
        count += 1;
        // ! Tolerancia, no igualdad exacta: la QR produce valores como 1e-17 donde matemáticamente hay 0.
        if (isDiagonal && i !== j && Math.abs(v) > tolerance) isDiagonal = false;
      }
    }

    return { name, isDiagonal };
  });

  return {
    max,
    min,
    average: sum / count,
    sum,
    count,
    anyDiagonal: perMatrix.some((m) => m.isDiagonal),
    matrices: perMatrix,
  };
}

module.exports = { computeStatistics };
