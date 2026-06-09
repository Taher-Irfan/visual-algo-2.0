import type { Algorithm, Step } from '../types';

/**
 * Odd-Even (Brick) Sort C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void oddEvenSort(int arr[], int n) {
 * 2:    bool sorted = false;
 * 3:    while (!sorted) {
 * 4:      sorted = true;
 * 5:      for (int i = 1; i + 1 < n; i += 2)   // odd phase
 * 6:        if (arr[i] > arr[i + 1]) {
 * 7:          swap(arr[i], arr[i + 1]); sorted = false;
 * 8:        }
 * 9:      for (int i = 0; i + 1 < n; i += 2)   // even phase
 * 10:       if (arr[i] > arr[i + 1]) {
 * 11:         swap(arr[i], arr[i + 1]); sorted = false;
 * 12:       }
 * 13:   }
 * 14: }
 */
const code = `void oddEvenSort(int arr[], int n) {
  bool sorted = false;
  while (!sorted) {
    sorted = true;
    for (int i = 1; i + 1 < n; i += 2)   // odd phase
      if (arr[i] > arr[i + 1]) {
        swap(arr[i], arr[i + 1]); sorted = false;
      }
    for (int i = 0; i + 1 < n; i += 2)   // even phase
      if (arr[i] > arr[i + 1]) {
        swap(arr[i], arr[i + 1]); sorted = false;
      }
  }
}`;

/**
 * Generate visualization steps for Odd-Even (Brick) Sort
 *
 * Algorithm:
 * - Alternates between two phases: compare/swap all (odd, odd+1) pairs,
 *   then all (even, even+1) pairs, until a full round makes no swap
 * - Each phase touches disjoint pairs, which is why this algorithm
 *   parallelizes naturally on hardware
 *
 * Time Complexity: O(n²) average/worst, O(n) best (already sorted)
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

  // Run one phase starting at `startIdx` (1 = odd pairs, 0 = even pairs).
  // Returns true if any pair was swapped.
  const runPhase = (startIdx: 0 | 1, compareLine: number, swapLine: number): boolean => {
    let phaseSwapped = false;
    for (let i = startIdx; i + 1 < n; i += 2) {
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: compareLine,
        highlights: { comparing: [i, i + 1] },
        operations: { comparisons, swaps },
        metadata: { i, j: i + 1 },
      });

      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swaps++;
        phaseSwapped = true;
        steps.push({
          array: [...arr],
          activeLine: swapLine,
          highlights: { swapping: [i, i + 1] },
          operations: { comparisons, swaps },
          metadata: { i, j: i + 1 },
        });
      }
    }
    return phaseSwapped;
  };

  let sorted = false;
  while (!sorted) {
    sorted = true;
    if (runPhase(1, 6, 7)) sorted = false;   // odd phase
    if (runPhase(0, 10, 11)) sorted = false; // even phase
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

export const oddEvenSort: Algorithm = {
  id: 'oddeven',
  name: 'Odd-Even Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
};
