import type { Algorithm, Step } from '../types';

/**
 * Shell Sort C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void shellSort(int arr[], int n) {
 * 2:    for (int gap = n / 2; gap > 0; gap /= 2) {
 * 3:      for (int i = gap; i < n; i++) {
 * 4:        int temp = arr[i];
 * 5:        int j = i;
 * 6:        while (j >= gap && arr[j - gap] > temp) {
 * 7:          arr[j] = arr[j - gap];
 * 8:          j -= gap;
 * 9:        }
 * 10:       arr[j] = temp;
 * 11:     }
 * 12:   }
 * 13: }
 */
const code = `void shellSort(int arr[], int n) {
  for (int gap = n / 2; gap > 0; gap /= 2) {
    for (int i = gap; i < n; i++) {
      int temp = arr[i];
      int j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
  }
}`;

/**
 * Generate visualization steps for Shell Sort algorithm
 *
 * Algorithm:
 * - Generalization of insertion sort that compares elements separated by a gap
 * - Starts with a large gap and reduces it (here, halving) until gap = 1
 * - The final gap-1 pass is a plain insertion sort over a nearly-sorted array
 *
 * Time Complexity: O(n log n) – O(n²) depending on the gap sequence
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

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    // Step: new gap (line 2)
    steps.push({
      array: [...arr],
      activeLine: 2,
      highlights: {},
      operations: { comparisons, swaps },
      metadata: { gap },
    });

    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;

      // Step: pick temp = arr[i] (line 4)
      steps.push({
        array: [...arr],
        activeLine: 4,
        highlights: { comparing: [i] },
        operations: { comparisons, swaps },
        metadata: { gap, i, j, key: temp },
      });

      while (j >= gap && arr[j - gap] > temp) {
        // Step: compare arr[j-gap] with temp (line 6)
        comparisons++;
        steps.push({
          array: [...arr],
          activeLine: 6,
          highlights: { comparing: [j - gap, j] },
          operations: { comparisons, swaps },
          metadata: { gap, i, j, key: temp },
        });

        // Step: shift element up by gap (line 7)
        arr[j] = arr[j - gap];
        swaps++;
        steps.push({
          array: [...arr],
          activeLine: 7,
          highlights: { swapping: [j - gap, j] },
          operations: { comparisons, swaps },
          metadata: { gap, i, j, key: temp },
        });

        j -= gap;
      }

      // Final compare that ended the while loop (when j >= gap)
      if (j >= gap) {
        comparisons++;
        steps.push({
          array: [...arr],
          activeLine: 6,
          highlights: { comparing: [j - gap, j] },
          operations: { comparisons, swaps },
          metadata: { gap, i, j, key: temp },
        });
      }

      // Step: place temp at its gapped position (line 10)
      arr[j] = temp;
      steps.push({
        array: [...arr],
        activeLine: 10,
        highlights: { swapping: [j] },
        operations: { comparisons, swaps },
        metadata: { gap, i, j, key: temp },
      });
    }
  }

  // Final step: fully sorted (line 13)
  steps.push({
    array: [...arr],
    activeLine: 13,
    highlights: { sorted: Array.from({ length: n }, (_, k) => k) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const shellSort: Algorithm = {
  id: 'shell',
  name: 'Shell Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n log n)',
    average: 'O(n^1.25)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
};
