import type { Algorithm, Step } from '../types';

/**
 * Fibonacci Search C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int fibonacciSearch(int arr[], int n, int target) {
 * 2:    int fib2 = 0, fib1 = 1, fib = 1;     // F(k-2), F(k-1), F(k)
 * 3:    while (fib < n) { fib2 = fib1; fib1 = fib; fib = fib1 + fib2; }
 * 4:    int offset = -1;
 * 5:    while (fib > 1) {
 * 6:      int i = min(offset + fib2, n - 1);
 * 7:      if (arr[i] < target) {
 * 8:        fib = fib1; fib1 = fib2; fib2 = fib - fib1;
 * 9:        offset = i;
 * 10:     } else if (arr[i] > target) {
 * 11:       fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1;
 * 12:     } else return i;
 * 13:   }
 * 14:   if (fib1 && offset + 1 < n && arr[offset + 1] == target)
 * 15:     return offset + 1;
 * 16:   return -1;
 * 17: }
 */
const code = `int fibonacciSearch(int arr[], int n, int target) {
  int fib2 = 0, fib1 = 1, fib = 1;     // F(k-2), F(k-1), F(k)
  while (fib < n) { fib2 = fib1; fib1 = fib; fib = fib1 + fib2; }
  int offset = -1;
  while (fib > 1) {
    int i = min(offset + fib2, n - 1);
    if (arr[i] < target) {
      fib = fib1; fib1 = fib2; fib2 = fib - fib1;
      offset = i;
    } else if (arr[i] > target) {
      fib = fib2; fib1 = fib1 - fib2; fib2 = fib - fib1;
    } else return i;
  }
  if (fib1 && offset + 1 < n && arr[offset + 1] == target)
    return offset + 1;
  return -1;
}`;

/**
 * Generate visualization steps for Fibonacci Search
 *
 * Algorithm:
 * - Requires a sorted array
 * - Like binary search but splits the range at Fibonacci-number offsets
 *   instead of the midpoint, using only addition/subtraction
 * - The remaining search range always has a Fibonacci-number length
 *
 * Time Complexity: O(log n)
 * Space Complexity: O(1) - only step storage for visualization
 */
function generateSteps(array: number[], target?: number): Step[] {
  const steps: Step[] = [];
  const arr = [...array].sort((a, b) => a - b);
  const n = arr.length;
  let comparisons = 0;

  const searchTarget = target !== undefined ? target : arr[Math.floor(Math.random() * n)];
  const faded = (lo: number, hi: number) =>
    Array.from({ length: n }, (_, i) => i).filter(i => i < lo || i > hi);

  const found = (idx: number, line: number): Step[] => {
    steps.push({
      array: [...arr],
      activeLine: line,
      highlights: { sorted: [idx] },
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: true, foundIndex: idx, currentIndex: idx },
    });
    steps.push({
      array: [...arr],
      activeLine: 17,
      highlights: { sorted: [idx] },
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: true, foundIndex: idx },
    });
    return steps;
  };

  // Step 0: function entry (line 1)
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });

  // Build the smallest Fibonacci number >= n (lines 2-3)
  let fib2 = 0;
  let fib1 = 1;
  let fib = 1;
  while (fib < n) {
    fib2 = fib1;
    fib1 = fib;
    fib = fib1 + fib2;
  }

  steps.push({
    array: [...arr],
    activeLine: 3,
    highlights: { comparing: [0, n - 1] },
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1, k: fib, searchRange: { left: 0, right: n - 1 } },
  });

  let offset = -1;

  while (fib > 1) {
    const i = Math.min(offset + fib2, n - 1);
    const right = Math.min(offset + fib, n) - 1;

    // Step: probe index i (line 6)
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 6,
      highlights: { comparing: [i], swapping: faded(offset + 1, right) },
      operations: { comparisons, swaps: 0 },
      metadata: {
        target: searchTarget,
        found: false,
        foundIndex: -1,
        currentIndex: i,
        k: fib,
        searchRange: { left: offset + 1, right, mid: i },
      },
    });

    if (arr[i] < searchTarget) {
      // Discard everything up to i; shrink by one Fibonacci step (lines 8-9)
      fib = fib1;
      fib1 = fib2;
      fib2 = fib - fib1;
      offset = i;
      steps.push({
        array: [...arr],
        activeLine: 9,
        highlights: { comparing: [Math.min(offset + 1, n - 1)], swapping: faded(offset + 1, Math.min(offset + fib, n) - 1) },
        operations: { comparisons, swaps: 0 },
        metadata: {
          target: searchTarget,
          found: false,
          foundIndex: -1,
          k: fib,
          searchRange: { left: offset + 1, right: Math.min(offset + fib, n) - 1 },
        },
      });
    } else if (arr[i] > searchTarget) {
      // Keep searching left of i; shrink by two Fibonacci steps (line 11)
      comparisons++;
      fib = fib2;
      fib1 = fib1 - fib2;
      fib2 = fib - fib1;
      steps.push({
        array: [...arr],
        activeLine: 11,
        highlights: { comparing: [Math.max(offset + 1, 0)], swapping: faded(offset + 1, Math.min(offset + fib, n) - 1) },
        operations: { comparisons, swaps: 0 },
        metadata: {
          target: searchTarget,
          found: false,
          foundIndex: -1,
          k: fib,
          searchRange: { left: offset + 1, right: Math.min(offset + fib, n) - 1 },
        },
      });
    } else {
      // Found at the probe (line 12)
      return found(i, 12);
    }
  }

  // Final single-element check (lines 14-15)
  if (fib1 === 1 && offset + 1 < n) {
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 14,
      highlights: { comparing: [offset + 1], swapping: faded(offset + 1, offset + 1) },
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: false, foundIndex: -1, currentIndex: offset + 1 },
    });
    if (arr[offset + 1] === searchTarget) {
      return found(offset + 1, 15);
    }
  }

  // Line 16: not found
  steps.push({
    array: [...arr],
    activeLine: 16,
    highlights: { swapping: Array.from({ length: n }, (_, i) => i) },
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });
  steps.push({
    array: [...arr],
    activeLine: 17,
    highlights: {},
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });

  return steps;
}

export const fibonacciSearch: Algorithm = {
  id: 'fibonacci',
  name: 'Fibonacci Search',
  generateSteps,
  code,
  complexity: {
    best: 'O(1)',
    average: 'O(log n)',
    worst: 'O(log n)',
    space: 'O(1)',
  },
};
