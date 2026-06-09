import type { Algorithm, Step } from '../types';

/**
 * Comb Sort C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void combSort(int arr[], int n) {
 * 2:    int gap = n;
 * 3:    bool swapped = true;
 * 4:    while (gap > 1 || swapped) {
 * 5:      gap = max(1, (gap * 10) / 13);
 * 6:      swapped = false;
 * 7:      for (int i = 0; i + gap < n; i++) {
 * 8:        if (arr[i] > arr[i + gap]) {
 * 9:          swap(arr[i], arr[i + gap]);
 * 10:         swapped = true;
 * 11:       }
 * 12:     }
 * 13:   }
 * 14: }
 */
const code = `void combSort(int arr[], int n) {
  int gap = n;
  bool swapped = true;
  while (gap > 1 || swapped) {
    gap = max(1, (gap * 10) / 13);
    swapped = false;
    for (int i = 0; i + gap < n; i++) {
      if (arr[i] > arr[i + gap]) {
        swap(arr[i], arr[i + gap]);
        swapped = true;
      }
    }
  }
}`;

/**
 * Generate visualization steps for Comb Sort
 *
 * Algorithm:
 * - Improves bubble sort by comparing elements a shrinking gap apart,
 *   killing "turtles" (small values near the end) early
 * - Gap shrinks by a factor of 1.3 each pass until it reaches 1,
 *   after which it behaves like bubble sort on nearly-sorted data
 *
 * Time Complexity: O(n²/2^p) average, O(n²) worst
 * Space Complexity: O(1) - in-place (only step storage for visualization)
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

  let gap = n;
  let swapped = true;

  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor((gap * 10) / 13));
    swapped = false;

    // Step: announce the new gap (line 5)
    steps.push({
      array: [...arr],
      activeLine: 5,
      highlights: {},
      operations: { comparisons, swaps },
      metadata: { gap },
    });

    for (let i = 0; i + gap < n; i++) {
      // Step: compare the gapped pair (line 8)
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: 8,
        highlights: { comparing: [i, i + gap] },
        operations: { comparisons, swaps },
        metadata: { gap, i, j: i + gap },
      });

      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        swaps++;
        swapped = true;

        // Step: swap the pair (line 9)
        steps.push({
          array: [...arr],
          activeLine: 9,
          highlights: { swapping: [i, i + gap] },
          operations: { comparisons, swaps },
          metadata: { gap, i, j: i + gap },
        });
      }
    }
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

export const combSort: Algorithm = {
  id: 'comb',
  name: 'Comb Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n log n)',
    average: 'O(n²/2^p)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
};
