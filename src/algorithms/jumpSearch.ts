import type { Algorithm, Step } from '../types';

/**
 * Jump Search C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  int jumpSearch(int arr[], int n, int target) {
 * 2:    int step = sqrt(n);
 * 3:    int prev = 0;
 * 4:    while (arr[min(step, n) - 1] < target) {
 * 5:      prev = step;
 * 6:      step += sqrt(n);
 * 7:      if (prev >= n) return -1;
 * 8:    }
 * 9:    while (arr[prev] < target) {
 * 10:     prev++;
 * 11:     if (prev == min(step, n)) return -1;
 * 12:   }
 * 13:   if (arr[prev] == target) return prev;
 * 14:   return -1;
 * 15: }
 */
const code = `int jumpSearch(int arr[], int n, int target) {
  int step = sqrt(n);
  int prev = 0;
  while (arr[min(step, n) - 1] < target) {
    prev = step;
    step += sqrt(n);
    if (prev >= n) return -1;
  }
  while (arr[prev] < target) {
    prev++;
    if (prev == min(step, n)) return -1;
  }
  if (arr[prev] == target) return prev;
  return -1;
}`;

/**
 * Generate visualization steps for Jump Search algorithm
 *
 * @param array - Input array to search (sorted internally)
 * @param target - Target value to find (defaults to a random element)
 * @returns Array of Step objects representing each state
 *
 * Algorithm:
 * - Requires a sorted array
 * - Jump ahead in fixed blocks of size √n until a block whose last
 *   element is >= target is found (the block that may contain the target)
 * - Linearly scan backwards/forwards within that block
 *
 * Time Complexity: O(√n)
 * Space Complexity: O(1) - only step storage for visualization
 */
function generateSteps(array: number[], target?: number): Step[] {
  const steps: Step[] = [];
  const arr = [...array].sort((a, b) => a - b); // Jump search needs sorted data
  const n = arr.length;
  let comparisons = 0;

  const searchTarget = target !== undefined ? target : arr[Math.floor(Math.random() * n)];
  const stepSize = Math.max(1, Math.floor(Math.sqrt(n)));

  // Fade every index outside [lo, hi] (inclusive) using the 'swapping' channel,
  // matching how Binary Search dims out-of-range elements.
  const faded = (lo: number, hi: number) =>
    Array.from({ length: n }, (_, i) => i).filter(i => i < lo || i > hi);

  // Step 0: function entry (line 1)
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });

  let prev = 0;
  let step = stepSize;

  // Step: initialize step / prev (lines 2-3)
  steps.push({
    array: [...arr],
    activeLine: 3,
    highlights: { comparing: [0], swapping: faded(0, Math.min(step, n) - 1) },
    operations: { comparisons, swaps: 0 },
    metadata: {
      target: searchTarget,
      found: false,
      foundIndex: -1,
      searchRange: { left: prev, right: Math.min(step, n) - 1 },
    },
  });

  // Phase 1: jump over blocks (line 4 loop)
  while (prev < n) {
    const boundary = Math.min(step, n) - 1;

    // Line 4: compare the block's last element with the target
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 4,
      highlights: { comparing: [boundary], swapping: faded(prev, boundary) },
      operations: { comparisons, swaps: 0 },
      metadata: {
        target: searchTarget,
        found: false,
        foundIndex: -1,
        currentIndex: boundary,
        searchRange: { left: prev, right: boundary },
      },
    });

    if (arr[boundary] >= searchTarget) {
      // The candidate block has been found; stop jumping
      break;
    }

    // Line 5-6: advance to the next block
    prev = step;
    step += stepSize;

    // Line 7: ran past the end of the array → not present
    if (prev >= n) {
      steps.push({
        array: [...arr],
        activeLine: 7,
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

    // Step: moved to next block (line 5)
    steps.push({
      array: [...arr],
      activeLine: 5,
      highlights: { comparing: [prev], swapping: faded(prev, Math.min(step, n) - 1) },
      operations: { comparisons, swaps: 0 },
      metadata: {
        target: searchTarget,
        found: false,
        foundIndex: -1,
        searchRange: { left: prev, right: Math.min(step, n) - 1 },
      },
    });
  }

  // Phase 2: linear scan inside the identified block (line 9 loop)
  const blockEnd = Math.min(step, n);
  while (prev < blockEnd) {
    // Line 9: compare current element with target
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 9,
      highlights: { comparing: [prev], swapping: faded(prev, blockEnd - 1) },
      operations: { comparisons, swaps: 0 },
      metadata: {
        target: searchTarget,
        found: false,
        foundIndex: -1,
        currentIndex: prev,
        searchRange: { left: prev, right: blockEnd - 1 },
      },
    });

    if (arr[prev] === searchTarget) {
      // Line 13: found the target
      steps.push({
        array: [...arr],
        activeLine: 13,
        highlights: { sorted: [prev] },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: true, foundIndex: prev, currentIndex: prev },
      });
      steps.push({
        array: [...arr],
        activeLine: 15,
        highlights: { sorted: [prev] },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: true, foundIndex: prev },
      });
      return steps;
    }

    if (arr[prev] > searchTarget) {
      // Passed where the target would be → not present
      break;
    }

    // Line 10: advance within the block
    prev++;
  }

  // Line 14: target not found
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

export const jumpSearch: Algorithm = {
  id: 'jump',
  name: 'Jump Search',
  generateSteps,
  code,
  complexity: {
    best: 'O(1)',
    average: 'O(√n)',
    worst: 'O(√n)',
    space: 'O(1)',
  },
};
