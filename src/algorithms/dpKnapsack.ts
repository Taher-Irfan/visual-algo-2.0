import type { DPAlgorithm, DPStep } from '../types';

/**
 * 0/1 Knapsack C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int knapsack(int W, int wt[], int val[], int n) {
 * 2:    vector dp(n + 1, vector<int>(W + 1, 0));
 * 3:  (blank)
 * 4:    for (int i = 1; i <= n; i++) {
 * 5:      for (int w = 0; w <= W; w++) {
 * 6:        if (wt[i-1] > w)
 * 7:          dp[i][w] = dp[i-1][w];
 * 8:        else
 * 9:          dp[i][w] = max(dp[i-1][w],
 * 10:                        val[i-1] + dp[i-1][w - wt[i-1]]);
 * 11:     }
 * 12:   }
 * 13:   return dp[n][W];
 * 14: }
 */
const code = `int knapsack(int W, int wt[], int val[], int n) {
  vector dp(n + 1, vector<int>(W + 1, 0));

  for (int i = 1; i <= n; i++) {
    for (int w = 0; w <= W; w++) {
      if (wt[i-1] > w)
        dp[i][w] = dp[i-1][w];
      else
        dp[i][w] = max(dp[i-1][w],
                       val[i-1] + dp[i-1][w - wt[i-1]]);
    }
  }
  return dp[n][W];
}`;

/**
 * Generate visualization steps for the 0/1 Knapsack DP.
 *
 * dp[i][w] = best value using the first i items within capacity w. Each cell
 * either copies the row above (item too heavy / skipped) or takes the max of
 * skipping and taking the item. Traceback recovers the chosen item set.
 *
 * Row labels show each item as "weight·value".
 *
 * Time Complexity: O(n·W)   Space Complexity: O(n·W)
 */
function generateSteps(size: number): DPStep[] {
  const steps: DPStep[] = [];
  const n = Math.max(3, Math.min(7, Math.floor(size / 2) + 1));
  const W = Math.max(6, Math.min(14, size + 3));
  const weights = Array.from({ length: n }, () => Math.floor(Math.random() * 5) + 1);
  const values = Array.from({ length: n }, () => Math.floor(Math.random() * 11) + 2);

  let cellsFilled = 0;
  let comparisons = 0;

  const table: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    new Array<number | null>(W + 1).fill(null)
  );
  const rowLabels = ['∅', ...weights.map((w, i) => `${w}·${values[i]}`)];
  const colLabels = Array.from({ length: W + 1 }, (_, w) => String(w));
  const base = { rowLabels, colLabels };
  const inputs = { weights: [...weights], values: [...values], capacity: W };
  const snap = () => table.map(row => [...row]);

  // Base row: zero items yield zero value (line 2)
  for (let w = 0; w <= W; w++) table[0][w] = 0;
  cellsFilled += W + 1;

  steps.push({
    table: snap(),
    ...base,
    activeLine: 2,
    highlights: {},
    metadata: { ...inputs, description: 'With no items the best value is 0 for every capacity' },
    operations: { cellsFilled, comparisons },
  });

  for (let i = 1; i <= n; i++) {
    const wt = weights[i - 1];
    const val = values[i - 1];

    for (let w = 0; w <= W; w++) {
      const tooHeavy = wt > w;
      comparisons++;

      // Step: can item i fit in capacity w? (line 6)
      steps.push({
        table: snap(),
        ...base,
        activeLine: 6,
        highlights: {
          current: [[i, w]],
          sources: tooHeavy ? [[i - 1, w]] : [[i - 1, w], [i - 1, w - wt]],
        },
        metadata: {
          ...inputs,
          i,
          j: w,
          description: tooHeavy
            ? `Item ${i} (weight ${wt}) doesn't fit in capacity ${w} — copy from above`
            : `Item ${i}: skip (${table[i - 1][w]}) vs take (${val} + ${table[i - 1][w - wt]})`,
        },
        operations: { cellsFilled, comparisons },
      });

      table[i][w] = tooHeavy
        ? (table[i - 1][w] as number)
        : Math.max(table[i - 1][w] as number, val + (table[i - 1][w - wt] as number));
      cellsFilled++;

      // Step: write the cell (line 7 or 9)
      steps.push({
        table: snap(),
        ...base,
        activeLine: tooHeavy ? 7 : 9,
        highlights: {
          current: [[i, w]],
          sources: tooHeavy ? [[i - 1, w]] : [[i - 1, w], [i - 1, w - wt]],
        },
        metadata: { ...inputs, i, j: w, description: `dp[${i}][${w}] = ${table[i][w]}` },
        operations: { cellsFilled, comparisons },
      });
    }
  }

  // Traceback: recover which items were taken
  const path: Array<[number, number]> = [];
  const taken: number[] = [];
  let w = W;
  for (let i = n; i >= 1; i--) {
    path.push([i, w]);
    if (table[i][w] !== table[i - 1][w]) {
      taken.unshift(i);
      w -= weights[i - 1];
    }
  }
  path.push([0, w]);

  // Final step: highlight the traceback (line 13)
  steps.push({
    table: snap(),
    ...base,
    activeLine: 13,
    highlights: { result: path },
    metadata: {
      ...inputs,
      finalResult: `value ${table[n][W]} with items {${taken.join(', ')}}`,
      description: `Best value ${table[n][W]} using items {${taken.join(', ')}} within capacity ${W}`,
    },
    operations: { cellsFilled, comparisons },
  });

  return steps;
}

export const dpKnapsack: DPAlgorithm = {
  id: 'knapsack',
  name: '0/1 Knapsack',
  generateSteps,
  code,
  complexity: {
    best: 'O(n·W)',
    average: 'O(n·W)',
    worst: 'O(n·W)',
    space: 'O(n·W)',
  },
};
