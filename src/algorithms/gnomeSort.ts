import type { Algorithm, Step } from '../types';

/**
 * Gnome Sort C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void gnomeSort(int arr[], int n) {
 * 2:    int pos = 0;
 * 3:    while (pos < n) {
 * 4:      if (pos == 0 || arr[pos] >= arr[pos - 1])
 * 5:        pos++;
 * 6:      else {
 * 7:        swap(arr[pos], arr[pos - 1]);
 * 8:        pos--;
 * 9:      }
 * 10:   }
 * 11: }
 */
const code = `void gnomeSort(int arr[], int n) {
  int pos = 0;
  while (pos < n) {
    if (pos == 0 || arr[pos] >= arr[pos - 1])
      pos++;
    else {
      swap(arr[pos], arr[pos - 1]);
      pos--;
    }
  }
}`;

/**
 * Generate visualization steps for Gnome Sort
 *
 * Algorithm:
 * - Walks forward while elements are in order; when an out-of-order pair is
 *   found, swaps it and steps backward, then resumes walking forward
 * - Conceptually similar to insertion sort with single-step moves
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

  let pos = 0;

  while (pos < n) {
    // Step: evaluate the ordering condition (line 4)
    if (pos > 0) comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 4,
      highlights: { comparing: pos === 0 ? [0] : [pos - 1, pos] },
      operations: { comparisons, swaps },
      metadata: { i: pos },
    });

    if (pos === 0 || arr[pos] >= arr[pos - 1]) {
      // In order — step forward (line 5)
      pos++;
      steps.push({
        array: [...arr],
        activeLine: 5,
        highlights: { comparing: pos < n ? [pos] : [] },
        operations: { comparisons, swaps },
        metadata: { i: pos },
      });
    } else {
      // Out of order — swap and step backward (lines 7-8)
      [arr[pos], arr[pos - 1]] = [arr[pos - 1], arr[pos]];
      swaps++;
      steps.push({
        array: [...arr],
        activeLine: 7,
        highlights: { swapping: [pos - 1, pos] },
        operations: { comparisons, swaps },
        metadata: { i: pos },
      });
      pos--;
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

export const gnomeSort: Algorithm = {
  id: 'gnome',
  name: 'Gnome Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
};
