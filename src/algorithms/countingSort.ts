import type { Algorithm, Step } from '../types';

/**
 * Counting Sort C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void countingSort(int arr[], int n) {
 * 2:    int maxVal = *max_element(arr, arr + n);
 * 3:    vector<int> count(maxVal + 1, 0);
 * 4:    for (int i = 0; i < n; i++)
 * 5:      count[arr[i]]++;
 * 6:    int idx = 0;
 * 7:    for (int v = 0; v <= maxVal; v++)
 * 8:      while (count[v]-- > 0)
 * 9:        arr[idx++] = v;
 * 10: }
 */
const code = `void countingSort(int arr[], int n) {
  int maxVal = *max_element(arr, arr + n);
  vector<int> count(maxVal + 1, 0);
  for (int i = 0; i < n; i++)
    count[arr[i]]++;
  int idx = 0;
  for (int v = 0; v <= maxVal; v++)
    while (count[v]-- > 0)
      arr[idx++] = v;
}`;

/**
 * Generate visualization steps for Counting Sort
 *
 * Algorithm:
 * - Counts the number of occurrences of each value (non-comparison sort)
 * - Rebuilds the array by emitting each value as many times as it was counted
 * - Works for non-negative integer keys; the visualizer uses values in [1, 100]
 *
 * Time Complexity: O(n + k) where k is the value range
 * Space Complexity: O(k) for the count array
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  const n = arr.length;
  let comparisons = 0; // counted as array reads/writes touched
  let swaps = 0;        // counted as placements into the output

  // Step 0: function entry (line 1)
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps },
  });

  const maxVal = Math.max(...arr);
  const count = new Array(maxVal + 1).fill(0);

  // Phase 1: tally counts (lines 4-5)
  for (let i = 0; i < n; i++) {
    comparisons++;
    count[arr[i]]++;
    steps.push({
      array: [...arr],
      activeLine: 5,
      highlights: { comparing: [i] },
      operations: { comparisons, swaps },
      metadata: { i, key: arr[i] },
    });
  }

  // Phase 2: rebuild the array in sorted order (lines 7-9)
  let idx = 0;
  for (let v = 0; v <= maxVal; v++) {
    while (count[v] > 0) {
      arr[idx] = v;
      count[v]--;
      swaps++;

      // Show the write, then mark the index as finalised
      steps.push({
        array: [...arr],
        activeLine: 9,
        highlights: {
          swapping: [idx],
          sorted: Array.from({ length: idx }, (_, k) => k),
        },
        operations: { comparisons, swaps },
        metadata: { i: idx, key: v },
      });

      idx++;
    }
  }

  // Final step: fully sorted (line 10)
  steps.push({
    array: [...arr],
    activeLine: 10,
    highlights: { sorted: Array.from({ length: n }, (_, k) => k) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const countingSort: Algorithm = {
  id: 'counting',
  name: 'Counting Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n + k)',
    average: 'O(n + k)',
    worst: 'O(n + k)',
    space: 'O(k)',
  },
};
