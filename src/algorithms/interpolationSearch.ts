import type { Algorithm, Step } from '../types';

/**
 * Interpolation Search C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int interpolationSearch(int arr[], int n, int target) {
 * 2:    int lo = 0, hi = n - 1;
 * 3:    while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
 * 4:      if (lo == hi) return arr[lo] == target ? lo : -1;
 * 5:      int pos = lo + ((target - arr[lo]) * (hi - lo)) /
 * 6:                     (arr[hi] - arr[lo]);
 * 7:      if (arr[pos] == target) return pos;
 * 8:      if (arr[pos] < target) lo = pos + 1;
 * 9:      else hi = pos - 1;
 * 10:   }
 * 11:   return -1;
 * 12: }
 */
const code = `int interpolationSearch(int arr[], int n, int target) {
  int lo = 0, hi = n - 1;
  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    if (lo == hi) return arr[lo] == target ? lo : -1;
    int pos = lo + ((target - arr[lo]) * (hi - lo)) /
                   (arr[hi] - arr[lo]);
    if (arr[pos] == target) return pos;
    if (arr[pos] < target) lo = pos + 1;
    else hi = pos - 1;
  }
  return -1;
}`;

/**
 * Generate visualization steps for Interpolation Search
 *
 * Algorithm:
 * - Requires a sorted array (ideally uniformly distributed)
 * - Estimates the probe position by linear interpolation between lo and hi
 *   rather than always probing the middle as binary search does
 *
 * Time Complexity: O(log log n) on uniform data, O(n) worst case
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
      activeLine: 7,
      highlights: { sorted: [idx] },
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: true, foundIndex: idx, currentIndex: idx },
    });
    steps.push({
      array: [...arr],
      activeLine: 12,
      highlights: { sorted: [idx] },
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: true, foundIndex: idx },
    });
    return steps;
  };

  const notFound = (): Step[] => {
    steps.push({
      array: [...arr],
      activeLine: 11,
      highlights: { swapping: Array.from({ length: n }, (_, i) => i) },
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: false, foundIndex: -1 },
    });
    steps.push({
      array: [...arr],
      activeLine: 12,
      highlights: {},
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: false, foundIndex: -1 },
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

  while (lo <= hi && searchTarget >= arr[lo] && searchTarget <= arr[hi]) {
    comparisons++;

    if (lo === hi) {
      if (arr[lo] === searchTarget) return found(lo);
      return notFound();
    }

    // Lines 5-6: interpolate the probe position
    const denom = arr[hi] - arr[lo];
    const pos = lo + Math.floor(((searchTarget - arr[lo]) * (hi - lo)) / denom);
    const probe = Math.max(lo, Math.min(hi, pos));

    steps.push({
      array: [...arr],
      activeLine: 5,
      highlights: { comparing: [probe], swapping: faded(lo, hi) },
      operations: { comparisons, swaps: 0 },
      metadata: {
        target: searchTarget,
        found: false,
        foundIndex: -1,
        currentIndex: probe,
        searchRange: { left: lo, right: hi, mid: probe },
      },
    });

    // Line 7: probe comparison
    comparisons++;
    if (arr[probe] === searchTarget) return found(probe);

    // Lines 8-9: narrow the range
    comparisons++;
    if (arr[probe] < searchTarget) {
      lo = probe + 1;
      steps.push({
        array: [...arr],
        activeLine: 8,
        highlights: { comparing: [Math.min(lo, n - 1)], swapping: faded(lo, hi) },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: false, foundIndex: -1, searchRange: { left: lo, right: hi } },
      });
    } else {
      hi = probe - 1;
      steps.push({
        array: [...arr],
        activeLine: 9,
        highlights: { comparing: [Math.max(hi, 0)], swapping: faded(lo, hi) },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: false, foundIndex: -1, searchRange: { left: lo, right: hi } },
      });
    }
  }

  // Range exhausted without a match
  return notFound();
}

export const interpolationSearch: Algorithm = {
  id: 'interpolation',
  name: 'Interpolation Search',
  generateSteps,
  code,
  complexity: {
    best: 'O(1)',
    average: 'O(log log n)',
    worst: 'O(n)',
    space: 'O(1)',
  },
};
