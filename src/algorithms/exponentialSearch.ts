import type { Algorithm, Step } from '../types';

/**
 * Exponential Search C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int exponentialSearch(int arr[], int n, int target) {
 * 2:    if (arr[0] == target) return 0;
 * 3:    int bound = 1;
 * 4:    while (bound < n && arr[bound] < target)
 * 5:      bound *= 2;
 * 6:    int lo = bound / 2;
 * 7:    int hi = min(bound, n - 1);
 * 8:    while (lo <= hi) {
 * 9:      int mid = lo + (hi - lo) / 2;
 * 10:     if (arr[mid] == target) return mid;
 * 11:     if (arr[mid] < target) lo = mid + 1;
 * 12:     else hi = mid - 1;
 * 13:   }
 * 14:   return -1;
 * 15: }
 */
const code = `int exponentialSearch(int arr[], int n, int target) {
  if (arr[0] == target) return 0;
  int bound = 1;
  while (bound < n && arr[bound] < target)
    bound *= 2;
  int lo = bound / 2;
  int hi = min(bound, n - 1);
  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`;

/**
 * Generate visualization steps for Exponential Search
 *
 * Algorithm:
 * - Requires a sorted array
 * - Finds a range by repeatedly doubling an index bound until arr[bound] >= target
 * - Runs a binary search within the discovered [bound/2, bound] range
 *
 * Time Complexity: O(log i) where i is the index of the target
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
      activeLine: 10,
      highlights: { sorted: [idx] },
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: true, foundIndex: idx, currentIndex: idx },
    });
    steps.push({
      array: [...arr],
      activeLine: 15,
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

  // Line 2: check the first element
  comparisons++;
  steps.push({
    array: [...arr],
    activeLine: 2,
    highlights: { comparing: [0] },
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1, currentIndex: 0 },
  });
  if (arr[0] === searchTarget) return found(0);

  // Phase 1: find the bound by doubling (line 4)
  let bound = 1;
  while (bound < n && arr[bound] < searchTarget) {
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 4,
      highlights: { comparing: [bound], swapping: faded(0, bound) },
      operations: { comparisons, swaps: 0 },
      metadata: {
        target: searchTarget,
        found: false,
        foundIndex: -1,
        currentIndex: bound,
        searchRange: { left: Math.floor(bound / 2), right: bound },
      },
    });
    bound *= 2;
  }

  // Phase 2: binary search within [bound/2, min(bound, n-1)] (line 8)
  let lo = Math.floor(bound / 2);
  let hi = Math.min(bound, n - 1);

  steps.push({
    array: [...arr],
    activeLine: 7,
    highlights: { comparing: [lo, hi], swapping: faded(lo, hi) },
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1, searchRange: { left: lo, right: hi } },
  });

  while (lo <= hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);

    // Line 9-10: probe the midpoint
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 10,
      highlights: { comparing: [mid], swapping: faded(lo, hi) },
      operations: { comparisons, swaps: 0 },
      metadata: {
        target: searchTarget,
        found: false,
        foundIndex: -1,
        currentIndex: mid,
        searchRange: { left: lo, right: hi, mid },
      },
    });

    if (arr[mid] === searchTarget) return found(mid);

    if (arr[mid] < searchTarget) {
      lo = mid + 1;
      steps.push({
        array: [...arr],
        activeLine: 11,
        highlights: { comparing: [Math.min(lo, n - 1)], swapping: faded(lo, hi) },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: false, foundIndex: -1, searchRange: { left: lo, right: hi, mid } },
      });
    } else {
      hi = mid - 1;
      steps.push({
        array: [...arr],
        activeLine: 12,
        highlights: { comparing: [Math.max(hi, 0)], swapping: faded(lo, hi) },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: false, foundIndex: -1, searchRange: { left: lo, right: hi, mid } },
      });
    }
  }

  // Line 14: not found
  steps.push({
    array: [...arr],
    activeLine: 14,
    highlights: { swapping: Array.from({ length: n }, (_, i) => i) },
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });
  steps.push({
    array: [...arr],
    activeLine: 15,
    highlights: {},
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });

  return steps;
}

export const exponentialSearch: Algorithm = {
  id: 'exponential',
  name: 'Exponential Search',
  generateSteps,
  code,
  complexity: {
    best: 'O(1)',
    average: 'O(log i)',
    worst: 'O(log n)',
    space: 'O(1)',
  },
};
