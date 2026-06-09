import type { DPAlgorithm, DPStep } from '../types';

/**
 * Fibonacci (bottom-up DP) C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int fib(int n) {
 * 2:    vector<int> dp(n + 1);
 * 3:    dp[0] = 0; dp[1] = 1;
 * 4:  (blank)
 * 5:    for (int i = 2; i <= n; i++)
 * 6:      dp[i] = dp[i-1] + dp[i-2];
 * 7:  (blank)
 * 8:    return dp[n];
 * 9:  }
 */
const code = `int fib(int n) {
  vector<int> dp(n + 1);
  dp[0] = 0; dp[1] = 1;

  for (int i = 2; i <= n; i++)
    dp[i] = dp[i-1] + dp[i-2];

  return dp[n];
}`;

/**
 * Generate visualization steps for bottom-up Fibonacci — the canonical
 * introduction to dynamic programming.
 *
 * A single-row table dp[0..n] is filled left to right; each cell is the sum
 * of the two before it. Demonstrates how memoizing overlapping subproblems
 * collapses the naive O(2ⁿ) recursion to a linear scan.
 *
 * Time Complexity: O(n)   Space Complexity: O(n)
 */
function generateSteps(size: number): DPStep[] {
  const steps: DPStep[] = [];
  const n = Math.max(6, Math.min(16, size + 4));

  let cellsFilled = 0;
  let comparisons = 0;

  const table: (number | null)[][] = [new Array<number | null>(n + 1).fill(null)];
  const rowLabels = ['F'];
  const colLabels = Array.from({ length: n + 1 }, (_, i) => String(i));
  const base = { rowLabels, colLabels };
  const snap = () => table.map(row => [...row]);

  // Base cases (line 3)
  table[0][0] = 0;
  table[0][1] = 1;
  cellsFilled += 2;
  steps.push({
    table: snap(),
    ...base,
    activeLine: 3,
    highlights: { current: [[0, 0], [0, 1]] },
    metadata: { description: 'Base cases: F(0) = 0, F(1) = 1' },
    operations: { cellsFilled, comparisons },
  });

  for (let i = 2; i <= n; i++) {
    // Step: about to combine the two previous results (line 5)
    steps.push({
      table: snap(),
      ...base,
      activeLine: 5,
      highlights: { current: [[0, i]], sources: [[0, i - 1], [0, i - 2]] },
      metadata: { i, description: `F(${i}) = F(${i - 1}) + F(${i - 2})` },
      operations: { cellsFilled, comparisons },
    });

    table[0][i] = (table[0][i - 1] as number) + (table[0][i - 2] as number);
    cellsFilled++;
    comparisons++;

    // Step: write the cell (line 6)
    steps.push({
      table: snap(),
      ...base,
      activeLine: 6,
      highlights: { current: [[0, i]], sources: [[0, i - 1], [0, i - 2]] },
      metadata: { i, description: `F(${i}) = ${table[0][i - 1]} + ${table[0][i - 2]} = ${table[0][i]}` },
      operations: { cellsFilled, comparisons },
    });
  }

  // Final step: the answer (line 8)
  steps.push({
    table: snap(),
    ...base,
    activeLine: 8,
    highlights: { result: [[0, n]] },
    metadata: { finalResult: table[0][n] as number, description: `F(${n}) = ${table[0][n]}` },
    operations: { cellsFilled, comparisons },
  });

  return steps;
}

export const dpFibonacci: DPAlgorithm = {
  id: 'fib',
  name: 'Fibonacci (Memoization)',
  generateSteps,
  code,
  complexity: {
    best: 'O(n)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(n)',
  },
};
