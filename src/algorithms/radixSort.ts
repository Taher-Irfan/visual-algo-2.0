import type { Algorithm, Step } from '../types';

/**
 * Radix Sort (LSD) C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void radixSort(int arr[], int n) {
 * 2:    int maxVal = *max_element(arr, arr + n);
 * 3:    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
 * 4:      int output[n], count[10] = {0};
 * 5:      for (int i = 0; i < n; i++)
 * 6:        count[(arr[i] / exp) % 10]++;
 * 7:      for (int d = 1; d < 10; d++)
 * 8:        count[d] += count[d - 1];
 * 9:      for (int i = n - 1; i >= 0; i--)
 * 10:       output[--count[(arr[i] / exp) % 10]] = arr[i];
 * 11:     for (int i = 0; i < n; i++)
 * 12:       arr[i] = output[i];
 * 13:   }
 * 14: }
 */
const code = `void radixSort(int arr[], int n) {
  int maxVal = *max_element(arr, arr + n);
  for (int exp = 1; maxVal / exp > 0; exp *= 10) {
    int output[n], count[10] = {0};
    for (int i = 0; i < n; i++)
      count[(arr[i] / exp) % 10]++;
    for (int d = 1; d < 10; d++)
      count[d] += count[d - 1];
    for (int i = n - 1; i >= 0; i--)
      output[--count[(arr[i] / exp) % 10]] = arr[i];
    for (int i = 0; i < n; i++)
      arr[i] = output[i];
  }
}`;

/**
 * Generate visualization steps for Radix Sort (Least Significant Digit)
 *
 * Algorithm:
 * - Stable-sorts the array one digit at a time, from least to most significant
 * - Each digit pass is a counting sort keyed on that digit
 * - After processing the most significant digit, the array is fully sorted
 *
 * Time Complexity: O(d · (n + b)) for d digits and base b
 * Space Complexity: O(n + b)
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  const n = arr.length;
  let comparisons = 0; // digit reads
  let swaps = 0;        // writes into the array

  // Step 0: function entry (line 1)
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps },
  });

  const maxVal = Math.max(...arr);

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    // Step: announce the current digit place (line 3)
    steps.push({
      array: [...arr],
      activeLine: 3,
      highlights: {},
      operations: { comparisons, swaps },
      metadata: { exp },
    });

    const count = new Array(10).fill(0);

    // Tally digit frequencies (lines 5-6)
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: 6,
        highlights: { comparing: [i] },
        operations: { comparisons, swaps },
        metadata: { exp, i, digit, key: arr[i] },
      });
    }

    // Prefix sums (lines 7-8)
    for (let d = 1; d < 10; d++) count[d] += count[d - 1];

    // Stable placement into the output buffer (lines 9-10)
    const output = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      output[--count[digit]] = arr[i];
    }

    // Copy the reordered values back, animating the new arrangement (lines 11-12)
    for (let i = 0; i < n; i++) arr[i] = output[i];
    swaps += n;
    steps.push({
      array: [...arr],
      activeLine: 12,
      highlights: { comparing: Array.from({ length: n }, (_, k) => k) },
      operations: { comparisons, swaps },
      metadata: { exp },
    });
  }

  // Final step: fully sorted (line 14)
  steps.push({
    array: [...arr],
    activeLine: 14,
    highlights: { sorted: Array.from({ length: n }, (_, k) => k) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const radixSort: Algorithm = {
  id: 'radix',
  name: 'Radix Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n · d)',
    average: 'O(n · d)',
    worst: 'O(n · d)',
    space: 'O(n + b)',
  },
};
