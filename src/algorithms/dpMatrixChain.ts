import type { DPAlgorithm, DPStep } from '../types';

/**
 * Matrix Chain Multiplication C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int matrixChain(int p[], int n) {        // n matrices, dims p[0..n]
 * 2:    vector dp(n+1, vector<int>(n+1, 0));
 * 3:    for (int len = 2; len <= n; len++)
 * 4:      for (int i = 1; i + len - 1 <= n; i++) {
 * 5:        int j = i + len - 1;
 * 6:        dp[i][j] = INF;
 * 7:        for (int k = i; k < j; k++) {
 * 8:          int cost = dp[i][k] + dp[k+1][j]
 * 9:                   + p[i-1]*p[k]*p[j];
 * 10:         dp[i][j] = min(dp[i][j], cost);
 * 11:       }
 * 12:     }
 * 13:   return dp[1][n];
 * 14: }
 */
const code = `int matrixChain(int p[], int n) {        // n matrices, dims p[0..n]
  vector dp(n+1, vector<int>(n+1, 0));
  for (int len = 2; len <= n; len++)
    for (int i = 1; i + len - 1 <= n; i++) {
      int j = i + len - 1;
      dp[i][j] = INF;
      for (int k = i; k < j; k++) {
        int cost = dp[i][k] + dp[k+1][j]
                 + p[i-1]*p[k]*p[j];
        dp[i][j] = min(dp[i][j], cost);
      }
    }
  return dp[1][n];
}`;

/**
 * Generate visualization steps for Matrix Chain Multiplication.
 *
 * dp[i][j] = the fewest scalar multiplications needed to multiply matrices
 * i..j, where matrix i has dimensions p[i-1] × p[i]. The table fills along
 * diagonals of increasing chain length, and for each cell every split point k
 * is tried. Only the upper triangle is meaningful; the diagonal is zero
 * (a single matrix costs nothing) and the lower triangle stays blank.
 *
 * Time Complexity: O(n³)   Space Complexity: O(n²)
 */
function generateSteps(size: number): DPStep[] {
  const steps: DPStep[] = [];
  const n = Math.max(3, Math.min(6, size - 1)); // number of matrices
  // Dimension chain: matrix i is p[i-1] × p[i]
  const p = Array.from({ length: n + 1 }, () => Math.floor(Math.random() * 8) + 2);

  let cellsFilled = 0;
  let comparisons = 0;

  // n×n grid; dp[i][j] lives at table[i-1][j-1]
  const table: (number | null)[][] = Array.from({ length: n }, () =>
    new Array<number | null>(n).fill(null)
  );
  const rowLabels = Array.from({ length: n }, (_, i) => `M${i + 1}`);
  const colLabels = Array.from({ length: n }, (_, j) => `M${j + 1}`);
  const base = { rowLabels, colLabels };
  const inputs = { inputArray: [...p] };
  const snap = () => table.map(row => [...row]);
  const cell = (i: number, j: number): [number, number] => [i - 1, j - 1];

  // Diagonal: a single matrix needs no multiplication
  for (let i = 1; i <= n; i++) table[i - 1][i - 1] = 0;
  cellsFilled += n;

  steps.push({
    table: snap(),
    ...base,
    activeLine: 2,
    highlights: { current: Array.from({ length: n }, (_, i) => [i, i] as [number, number]) },
    metadata: { ...inputs, description: `Dimensions ${p.join('×')} — a lone matrix costs 0` },
    operations: { cellsFilled, comparisons },
  });

  for (let len = 2; len <= n; len++) {
    for (let i = 1; i + len - 1 <= n; i++) {
      const j = i + len - 1;
      let bestCost = Infinity;
      let bestK = i;

      for (let k = i; k < j; k++) {
        const cost = (table[i - 1][k - 1] as number) + (table[k][j - 1] as number) + p[i - 1] * p[k] * p[j];
        comparisons++;

        // Step: evaluate split at k (lines 7-9)
        steps.push({
          table: snap(),
          ...base,
          activeLine: 8,
          highlights: {
            current: [cell(i, j)],
            sources: [cell(i, k), cell(k + 1, j)],
          },
          metadata: {
            ...inputs,
            i,
            j,
            description: `(${i}..${j}) split at ${k}: ${table[i - 1][k - 1]} + ${table[k][j - 1]} + ${p[i - 1]}·${p[k]}·${p[j]} = ${cost}`,
          },
          operations: { cellsFilled, comparisons },
        });

        if (cost < bestCost) {
          bestCost = cost;
          bestK = k;
        }
      }

      table[i - 1][j - 1] = bestCost;
      cellsFilled++;

      // Step: commit the best split (line 10)
      steps.push({
        table: snap(),
        ...base,
        activeLine: 10,
        highlights: {
          current: [cell(i, j)],
          sources: [cell(i, bestK), cell(bestK + 1, j)],
        },
        metadata: { ...inputs, i, j, description: `dp[${i}][${j}] = ${bestCost} (best split at ${bestK})` },
        operations: { cellsFilled, comparisons },
      });
    }
  }

  // Final step: the answer is the whole chain (line 13)
  steps.push({
    table: snap(),
    ...base,
    activeLine: 13,
    highlights: { result: [cell(1, n)] },
    metadata: {
      ...inputs,
      finalResult: `${table[0][n - 1]} multiplications`,
      description: `Cheapest way to multiply all ${n} matrices: ${table[0][n - 1]} scalar multiplications`,
    },
    operations: { cellsFilled, comparisons },
  });

  return steps;
}

export const dpMatrixChain: DPAlgorithm = {
  id: 'matrixchain',
  name: 'Matrix Chain Multiplication',
  generateSteps,
  code,
  complexity: {
    best: 'O(n³)',
    average: 'O(n³)',
    worst: 'O(n³)',
    space: 'O(n²)',
  },
};
