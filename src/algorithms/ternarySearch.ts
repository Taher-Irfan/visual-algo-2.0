import type { Algorithm, Step } from '../types';

/**
 * Ternary Search C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int ternarySearch(int arr[], int n, int target) {
 * 2:    int lo = 0, hi = n - 1;
 * 3:    while (lo <= hi) {
 * 4:      int m1 = lo + (hi - lo) / 3;
 * 5:      int m2 = hi - (hi - lo) / 3;
 * 6:      if (arr[m1] == target) return m1;
 * 7:      if (arr[m2] == target) return m2;
 * 8:      if (target < arr[m1]) hi = m1 - 1;
 * 9:      else if (target > arr[m2]) lo = m2 + 1;
 * 10:     else { lo = m1 + 1; hi = m2 - 1; }
 * 11:   }
 * 12:   return -1;
 * 13: }
 */
const code = `int ternarySearch(int arr[], int n, int target) {
  int lo = 0, hi = n - 1;
  while (lo <= hi) {
    int m1 = lo + (hi - lo) / 3;
    int m2 = hi - (hi - lo) / 3;
    if (arr[m1] == target) return m1;
    if (arr[m2] == target) return m2;
    if (target < arr[m1]) hi = m1 - 1;
    else if (target > arr[m2]) lo = m2 + 1;
    else { lo = m1 + 1; hi = m2 - 1; }
  }
  return -1;
}`;

/**
 * Generate visualization steps for Ternary Search
 *
 * Algorithm:
 * - Requires a sorted array
 * - Splits the range into three parts using two midpoints (m1, m2)
 * - Discards one or two of the thirds each iteration based on comparisons
 *
 * Time Complexity: O(log₃ n)
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

  const found = (idx: number): Step[] => {
    steps.push({
      array: [...arr],
      activeLine: idx >= 0 ? 6 : 12,
      highlights: { sorted: [idx] },
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: true, foundIndex: idx, currentIndex: idx },
    });
    steps.push({
      array: [...arr],
      activeLine: 13,
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

  let lo = 0;
  let hi = n - 1;

  steps.push({
    array: [...arr],
    activeLine: 2,
    highlights: { comparing: [lo, hi] },
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1, searchRange: { left: lo, right: hi } },
  });

  while (lo <= hi) {
    const m1 = Math.floor(lo + (hi - lo) / 3);
    const m2 = Math.floor(hi - (hi - lo) / 3);

    // Lines 4-5: compute the two midpoints (m1 marked with the M badge, m2 also highlighted)
    steps.push({
      array: [...arr],
      activeLine: 5,
      highlights: { comparing: [m1, m2], swapping: faded(lo, hi) },
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: false, foundIndex: -1, searchRange: { left: lo, right: hi, mid: m1 } },
    });

    // Line 6: compare with the first midpoint
    comparisons++;
    if (arr[m1] === searchTarget) return found(m1);

    // Line 7: compare with the second midpoint
    comparisons++;
    if (arr[m2] === searchTarget) return found(m2);

    // Lines 8-10: discard the appropriate third(s)
    comparisons++;
    if (searchTarget < arr[m1]) {
      hi = m1 - 1;
      steps.push({
        array: [...arr],
        activeLine: 8,
        highlights: { comparing: [Math.max(hi, 0)], swapping: faded(lo, hi) },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: false, foundIndex: -1, searchRange: { left: lo, right: hi } },
      });
    } else if (searchTarget > arr[m2]) {
      comparisons++;
      lo = m2 + 1;
      steps.push({
        array: [...arr],
        activeLine: 9,
        highlights: { comparing: [Math.min(lo, n - 1)], swapping: faded(lo, hi) },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: false, foundIndex: -1, searchRange: { left: lo, right: hi } },
      });
    } else {
      lo = m1 + 1;
      hi = m2 - 1;
      steps.push({
        array: [...arr],
        activeLine: 10,
        highlights: { comparing: [lo, hi].filter(x => x >= 0 && x < n), swapping: faded(lo, hi) },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: false, foundIndex: -1, searchRange: { left: lo, right: hi } },
      });
    }
  }

  // Line 12: not found
  steps.push({
    array: [...arr],
    activeLine: 12,
    highlights: { swapping: Array.from({ length: n }, (_, i) => i) },
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });
  steps.push({
    array: [...arr],
    activeLine: 13,
    highlights: {},
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });

  return steps;
}

export const ternarySearch: Algorithm = {
  id: 'ternary',
  name: 'Ternary Search',
  generateSteps,
  code,
  complexity: {
    best: 'O(1)',
    average: 'O(log₃ n)',
    worst: 'O(log₃ n)',
    space: 'O(1)',
  },
};
