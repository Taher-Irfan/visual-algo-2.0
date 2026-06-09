import type { Algorithm, Step } from '../types';

/**
 * Pancake Sort C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void pancakeSort(int arr[], int n) {
 * 2:    for (int size = n; size > 1; size--) {
 * 3:      int maxIdx = 0;
 * 4:      for (int i = 1; i < size; i++)
 * 5:        if (arr[i] > arr[maxIdx]) maxIdx = i;
 * 6:      if (maxIdx == size - 1) continue;
 * 7:      flip(arr, maxIdx);      // bring max to front
 * 8:      flip(arr, size - 1);    // bring max to its place
 * 9:    }
 * 10: }
 * 11: (blank)
 * 12: void flip(int arr[], int k) {
 * 13:   reverse(arr, arr + k + 1);
 * 14: }
 */
const code = `void pancakeSort(int arr[], int n) {
  for (int size = n; size > 1; size--) {
    int maxIdx = 0;
    for (int i = 1; i < size; i++)
      if (arr[i] > arr[maxIdx]) maxIdx = i;
    if (maxIdx == size - 1) continue;
    flip(arr, maxIdx);      // bring max to front
    flip(arr, size - 1);    // bring max to its place
  }
}

void flip(int arr[], int k) {
  reverse(arr, arr + k + 1);
}`;

/**
 * Generate visualization steps for Pancake Sort
 *
 * Algorithm:
 * - The only operation allowed is "flip": reversing a prefix of the array
 *   (like flipping a stack of pancakes with a spatula)
 * - Each round finds the largest unsorted pancake, flips it to the top,
 *   then flips it down to its final position
 *
 * Time Complexity: O(n²) comparisons, O(n) flips
 * Space Complexity: O(1) - in-place (only step storage for visualization)
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0; // counts element moves performed by flips

  const sortedTail = (size: number) =>
    Array.from({ length: n - size }, (_, k) => size + k);

  // Reverse the prefix [0..k], counting the swap operations it performs
  const flip = (k: number) => {
    let lo = 0;
    let hi = k;
    while (lo < hi) {
      [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
      swaps++;
      lo++;
      hi--;
    }
  };

  // Step 0: function entry (line 1)
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps },
  });

  for (let size = n; size > 1; size--) {
    // Find the index of the maximum in the unsorted prefix (lines 3-5)
    let maxIdx = 0;
    for (let i = 1; i < size; i++) {
      comparisons++;
      if (arr[i] > arr[maxIdx]) maxIdx = i;
    }

    // Step: located the max pancake (line 5)
    steps.push({
      array: [...arr],
      activeLine: 5,
      highlights: { comparing: [maxIdx], sorted: sortedTail(size) },
      operations: { comparisons, swaps },
      metadata: { i: size - 1, m: maxIdx },
    });

    // Already at the bottom of the unsorted stack (line 6)
    if (maxIdx === size - 1) continue;

    // Flip the max pancake to the front (line 7)
    if (maxIdx > 0) {
      flip(maxIdx);
      steps.push({
        array: [...arr],
        activeLine: 7,
        highlights: {
          swapping: Array.from({ length: maxIdx + 1 }, (_, k) => k),
          sorted: sortedTail(size),
        },
        operations: { comparisons, swaps },
        metadata: { i: size - 1, m: maxIdx },
      });
    }

    // Flip it down to its final position (line 8)
    flip(size - 1);
    steps.push({
      array: [...arr],
      activeLine: 8,
      highlights: {
        swapping: Array.from({ length: size }, (_, k) => k),
        sorted: sortedTail(size),
      },
      operations: { comparisons, swaps },
      metadata: { i: size - 1, m: maxIdx },
    });

    // Step: position size-1 is now final (line 2)
    steps.push({
      array: [...arr],
      activeLine: 2,
      highlights: { sorted: sortedTail(size - 1) },
      operations: { comparisons, swaps },
      metadata: { i: size - 1 },
    });
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

export const pancakeSort: Algorithm = {
  id: 'pancake',
  name: 'Pancake Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
};
