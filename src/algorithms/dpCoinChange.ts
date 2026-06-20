import type { DPAlgorithm, DPStep } from '../types';

/**
 * Coin Change — number of ways (unbounded) C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int coinChange(int coins[], int k, int amount) {
 * 2:    vector dp(k + 1, vector<int>(amount + 1, 0));
 * 3:    for (int i = 0; i <= k; i++) dp[i][0] = 1;  // empty selection
 * 4:    for (int i = 1; i <= k; i++)
 * 5:      for (int a = 1; a <= amount; a++) {
 * 6:        dp[i][a] = dp[i-1][a];          // skip coin i
 * 7:        if (a >= coins[i-1])
 * 8:          dp[i][a] += dp[i][a-coins[i-1]]; // use coin i
 * 9:      }
 * 10:   return dp[k][amount];
 * 11: }
 */
const code = `int coinChange(int coins[], int k, int amount) {
  vector dp(k + 1, vector<int>(amount + 1, 0));
  for (int i = 0; i <= k; i++) dp[i][0] = 1;  // empty selection
  for (int i = 1; i <= k; i++)
    for (int a = 1; a <= amount; a++) {
      dp[i][a] = dp[i-1][a];          // skip coin i
      if (a >= coins[i-1])
        dp[i][a] += dp[i][a-coins[i-1]]; // use coin i
    }
  return dp[k][amount];
}`;

/**
 * Generate visualization steps for the Coin Change DP, counting the number of
 * distinct combinations that sum to a target amount (coins reusable).
 *
 * dp[i][a] = ways to make amount a using the first i coin denominations. Each
 * cell adds the ways that skip coin i (the row above) to the ways that use at
 * least one coin i (the same row, amount − coin). Every value is a clean
 * non-negative count, which keeps the table easy to read.
 *
 * Time Complexity: O(k·amount)   Space Complexity: O(k·amount)
 */
function generateSteps(size: number): DPStep[] {
  const steps: DPStep[] = [];
  const k = Math.max(2, Math.min(5, Math.floor(size / 2) + 1));
  const amount = Math.max(6, Math.min(14, size + 3));

  // Distinct small denominations, always including 1 so a solution exists
  const pool = [1, 2, 3, 5];
  const coins = pool.slice(0, k);

  let cellsFilled = 0;
  let comparisons = 0;

  const table: (number | null)[][] = Array.from({ length: k + 1 }, () =>
    new Array<number | null>(amount + 1).fill(null)
  );
  const rowLabels = ['∅', ...coins.map(c => `${c}¢`)];
  const colLabels = Array.from({ length: amount + 1 }, (_, a) => String(a));
  const base = { rowLabels, colLabels };
  const inputs = { inputArray: [...coins], capacity: amount };
  const snap = () => table.map(row => [...row]);

  // Base: exactly one way (use nothing) to make amount 0; zero ways otherwise
  table[0][0] = 1;
  for (let a = 1; a <= amount; a++) table[0][a] = 0;
  cellsFilled += amount + 1;

  steps.push({
    table: snap(),
    ...base,
    activeLine: 3,
    highlights: { current: [[0, 0]] },
    metadata: { ...inputs, description: 'With no coins there is exactly one way to make 0 and no way to make more' },
    operations: { cellsFilled, comparisons },
  });

  for (let i = 1; i <= k; i++) {
    const coin = coins[i - 1];
    // dp[i][0] = 1 (the empty selection still makes 0)
    table[i][0] = 1;
    cellsFilled++;

    for (let a = 1; a <= amount; a++) {
      const canUse = a >= coin;
      comparisons++;

      // Step: consider coin i for amount a (lines 6-7)
      steps.push({
        table: snap(),
        ...base,
        activeLine: 7,
        highlights: {
          current: [[i, a]],
          sources: canUse ? [[i - 1, a], [i, a - coin]] : [[i - 1, a]],
        },
        metadata: {
          ...inputs,
          i,
          j: a,
          description: canUse
            ? `Amount ${a}: skip (${table[i - 1][a]}) + use ${coin}¢ (${table[i][a - coin]})`
            : `Coin ${coin}¢ is larger than ${a} — only the skip case applies`,
        },
        operations: { cellsFilled, comparisons },
      });

      table[i][a] = (table[i - 1][a] as number) + (canUse ? (table[i][a - coin] as number) : 0);
      cellsFilled++;

      // Step: write the cell (line 6 or 8)
      steps.push({
        table: snap(),
        ...base,
        activeLine: canUse ? 8 : 6,
        highlights: {
          current: [[i, a]],
          sources: canUse ? [[i - 1, a], [i, a - coin]] : [[i - 1, a]],
        },
        metadata: { ...inputs, i, j: a, description: `dp[${i}][${a}] = ${table[i][a]} way(s)` },
        operations: { cellsFilled, comparisons },
      });
    }
  }

  // Final step: highlight the answer cell (line 10)
  steps.push({
    table: snap(),
    ...base,
    activeLine: 10,
    highlights: { result: [[k, amount]] },
    metadata: {
      ...inputs,
      finalResult: `${table[k][amount]} ways`,
      description: `${table[k][amount]} distinct way(s) to make ${amount}¢ with coins {${coins.join(', ')}}`,
    },
    operations: { cellsFilled, comparisons },
  });

  return steps;
}

export const dpCoinChange: DPAlgorithm = {
  id: 'coinchange',
  name: 'Coin Change (Ways)',
  generateSteps,
  code,
  complexity: {
    best: 'O(k·n)',
    average: 'O(k·n)',
    worst: 'O(k·n)',
    space: 'O(k·n)',
  },
};
