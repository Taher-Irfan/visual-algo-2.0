import type { DPAlgorithm, DPStep } from '../types';

/**
 * Longest Increasing Subsequence C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int lis(int arr[], int n) {
 * 2:    vector<int> dp(n, 1);
 * 3:  (blank)
 * 4:    for (int i = 1; i < n; i++)
 * 5:      for (int j = 0; j < i; j++)
 * 6:        if (arr[j] < arr[i])
 * 7:          dp[i] = max(dp[i], dp[j] + 1);
 * 8:  (blank)
 * 9:    return *max_element(dp.begin(), dp.end());
 * 10: }
 */
const code = `int lis(int arr[], int n) {
  vector<int> dp(n, 1);

  for (int i = 1; i < n; i++)
    for (int j = 0; j < i; j++)
      if (arr[j] < arr[i])
        dp[i] = max(dp[i], dp[j] + 1);

  return *max_element(dp.begin(), dp.end());
}`;

/**
 * Generate visualization steps for the Longest Increasing Subsequence DP.
 *
 * The table shows two rows: the input array (row 0, fixed) and dp (row 1),
 * where dp[i] = length of the longest increasing subsequence ending at i.
 * Each dp[i] scans every j < i with a smaller value and extends the best one.
 * Traceback from the maximum recovers the subsequence.
 *
 * Time Complexity: O(n²)   Space Complexity: O(n)
 */
function generateSteps(size: number): DPStep[] {
  const steps: DPStep[] = [];
  const n = Math.max(5, Math.min(12, size));
  const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 20) + 1);

  let cellsFilled = 0;
  let comparisons = 0;

  const dp = new Array<number>(n).fill(1);
  const parent = new Array<number>(n).fill(-1);

  const rowLabels = ['arr', 'dp'];
  const colLabels = Array.from({ length: n }, (_, i) => String(i));
  const base = { rowLabels, colLabels };
  // Row 0 mirrors the input; row 1 is the dp array under construction
  const snap = (upto: number): (number | null)[][] => [
    arr.map(v => v as number | null),
    dp.map((v, idx) => (idx <= upto ? v : null)),
  ];

  // Initialise dp[i] = 1 (line 2): every element is a subsequence of length 1
  cellsFilled += n;
  steps.push({
    table: snap(0),
    ...base,
    activeLine: 2,
    highlights: { current: [[1, 0]] },
    metadata: { inputArray: [...arr], description: 'Every element alone is an increasing subsequence of length 1' },
    operations: { cellsFilled, comparisons },
  });

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      comparisons++;
      const extends_ = arr[j] < arr[i];

      // Step: does arr[j] < arr[i]? (line 6)
      steps.push({
        table: snap(i),
        ...base,
        activeLine: 6,
        highlights: {
          current: [[1, i], [0, i]],
          sources: [[0, j], [1, j]],
        },
        metadata: {
          inputArray: [...arr],
          i,
          j,
          description: extends_
            ? `arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]} — can extend (dp[${j}]+1 = ${dp[j] + 1})`
            : `arr[${j}]=${arr[j]} ≥ arr[${i}]=${arr[i]} — cannot extend`,
        },
        operations: { cellsFilled, comparisons },
      });

      if (extends_ && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        parent[i] = j;
        cellsFilled++;

        // Step: improve dp[i] (line 7)
        steps.push({
          table: snap(i),
          ...base,
          activeLine: 7,
          highlights: {
            current: [[1, i]],
            sources: [[1, j]],
          },
          metadata: { inputArray: [...arr], i, j, description: `dp[${i}] = ${dp[i]}` },
          operations: { cellsFilled, comparisons },
        });
      }
    }
  }

  // Traceback from the maximum dp value
  let best = 0;
  for (let i = 1; i < n; i++) if (dp[i] > dp[best]) best = i;
  const path: Array<[number, number]> = [];
  const seq: number[] = [];
  for (let k = best; k !== -1; k = parent[k]) {
    path.push([1, k], [0, k]);
    seq.unshift(arr[k]);
  }

  // Final step: highlight the subsequence (line 9)
  steps.push({
    table: snap(n - 1),
    ...base,
    activeLine: 9,
    highlights: { result: path },
    metadata: {
      inputArray: [...arr],
      finalResult: `[${seq.join(', ')}] (length ${dp[best]})`,
      description: `Longest increasing subsequence: [${seq.join(', ')}]`,
    },
    operations: { cellsFilled, comparisons },
  });

  return steps;
}

export const dpLIS: DPAlgorithm = {
  id: 'lis',
  name: 'Longest Increasing Subsequence',
  generateSteps,
  code,
  complexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(n)',
  },
};
