import type { Algorithm, Step } from '../types';

/**
 * Bucket Sort C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void bucketSort(int arr[], int n) {
 * 2:    vector<int> bucket[n];
 * 3:    for (int i = 0; i < n; i++)
 * 4:      bucket[n * arr[i] / MAX].push_back(arr[i]);
 * 5:    for (int i = 0; i < n; i++)
 * 6:      sort(bucket[i].begin(), bucket[i].end());
 * 7:    int idx = 0;
 * 8:    for (int i = 0; i < n; i++)
 * 9:      for (int v : bucket[i])
 * 10:       arr[idx++] = v;
 * 11: }
 */
const code = `void bucketSort(int arr[], int n) {
  vector<int> bucket[n];
  for (int i = 0; i < n; i++)
    bucket[n * arr[i] / MAX].push_back(arr[i]);
  for (int i = 0; i < n; i++)
    sort(bucket[i].begin(), bucket[i].end());
  int idx = 0;
  for (int i = 0; i < n; i++)
    for (int v : bucket[i])
      arr[idx++] = v;
}`;

/**
 * Generate visualization steps for Bucket Sort.
 *
 * Algorithm:
 * - Scatter elements into n buckets keyed by value range (distribution sort)
 * - Sort each bucket individually (insertion sort here)
 * - Concatenate the buckets back in order
 *
 * Like counting/radix sort this rebuilds the array rather than swapping in
 * place, so the visualization shows the scatter pass followed by the array
 * being reconstructed bucket by bucket.
 *
 * Time Complexity: O(n + k) average, O(n²) worst (everything in one bucket)
 * Space Complexity: O(n + k)
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  // Step 0: function entry (line 1)
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps },
  });

  const MAX = Math.max(...arr, 1) + 1;
  const buckets: number[][] = Array.from({ length: n }, () => []);

  // Phase 1: scatter into buckets (lines 3-4)
  for (let i = 0; i < n; i++) {
    const b = Math.min(n - 1, Math.floor((n * arr[i]) / MAX));
    buckets[b].push(arr[i]);
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 4,
      highlights: { comparing: [i] },
      operations: { comparisons, swaps },
      metadata: { i, key: arr[i], j: b },
    });
  }

  // Phase 2: sort each bucket (insertion sort), lines 5-6
  for (let b = 0; b < n; b++) {
    const bucket = buckets[b];
    for (let i = 1; i < bucket.length; i++) {
      const cur = bucket[i];
      let j = i - 1;
      while (j >= 0 && bucket[j] > cur) {
        comparisons++;
        bucket[j + 1] = bucket[j];
        j--;
      }
      bucket[j + 1] = cur;
    }
  }

  // Phase 3: concatenate buckets back into the array (lines 8-10)
  let idx = 0;
  for (let b = 0; b < n; b++) {
    for (const v of buckets[b]) {
      arr[idx] = v;
      swaps++;
      steps.push({
        array: [...arr],
        activeLine: 10,
        highlights: {
          swapping: [idx],
          sorted: Array.from({ length: idx }, (_, k) => k),
        },
        operations: { comparisons, swaps },
        metadata: { i: idx, j: b, key: v },
      });
      idx++;
    }
  }

  // Final step: fully sorted (line 11)
  steps.push({
    array: [...arr],
    activeLine: 11,
    highlights: { sorted: Array.from({ length: n }, (_, k) => k) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const bucketSort: Algorithm = {
  id: 'bucket',
  name: 'Bucket Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n + k)',
    average: 'O(n + k)',
    worst: 'O(n²)',
    space: 'O(n + k)',
  },
};
