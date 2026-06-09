import type { Algorithm, Step } from '../types';

/**
 * Cycle Sort C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void cycleSort(int arr[], int n) {
 * 2:    for (int start = 0; start < n - 1; start++) {
 * 3:      int item = arr[start];
 * 4:      int pos = start;
 * 5:      for (int i = start + 1; i < n; i++)
 * 6:        if (arr[i] < item) pos++;
 * 7:      if (pos == start) continue;
 * 8:      while (item == arr[pos]) pos++;
 * 9:      swap(item, arr[pos]);
 * 10:     while (pos != start) {
 * 11:       pos = start;
 * 12:       for (int i = start + 1; i < n; i++)
 * 13:         if (arr[i] < item) pos++;
 * 14:       while (item == arr[pos]) pos++;
 * 15:       swap(item, arr[pos]);
 * 16:     }
 * 17:   }
 * 18: }
 */
const code = `void cycleSort(int arr[], int n) {
  for (int start = 0; start < n - 1; start++) {
    int item = arr[start];
    int pos = start;
    for (int i = start + 1; i < n; i++)
      if (arr[i] < item) pos++;
    if (pos == start) continue;
    while (item == arr[pos]) pos++;
    swap(item, arr[pos]);
    while (pos != start) {
      pos = start;
      for (int i = start + 1; i < n; i++)
        if (arr[i] < item) pos++;
      while (item == arr[pos]) pos++;
      swap(item, arr[pos]);
    }
  }
}`;

/**
 * Generate visualization steps for Cycle Sort
 *
 * Algorithm:
 * - Minimizes the number of writes: each value is written at most once
 *   into its final position by rotating whole permutation cycles
 * - For each cycle start, counts how many elements are smaller to find the
 *   item's exact final position, places it there, and continues the cycle
 *   with the displaced value until the cycle closes
 *
 * Time Complexity: O(n²) in all cases (write-optimal, not comparison-optimal)
 * Space Complexity: O(1) - in-place (only step storage for visualization)
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0; // counts writes into the array

  // Step 0: function entry (line 1)
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps },
  });

  // Count how many elements after `start` are smaller than `item`,
  // emitting comparison steps along the way (lines 5-6 / 12-13).
  const findPos = (start: number, item: number, line: number): number => {
    let pos = start;
    for (let i = start + 1; i < n; i++) {
      comparisons++;
      if (arr[i] < item) pos++;
    }
    steps.push({
      array: [...arr],
      activeLine: line,
      highlights: { comparing: [start, pos] },
      operations: { comparisons, swaps },
      metadata: { i: start, minIdx: pos, key: item },
    });
    return pos;
  };

  for (let start = 0; start < n - 1; start++) {
    let item = arr[start];

    // Step: pick the cycle's item (line 3)
    steps.push({
      array: [...arr],
      activeLine: 3,
      highlights: { comparing: [start] },
      operations: { comparisons, swaps },
      metadata: { i: start, key: item },
    });

    let pos = findPos(start, item, 6);

    // Item already in place — move to the next cycle (line 7)
    if (pos === start) continue;

    // Skip past duplicates of item (line 8)
    while (item === arr[pos]) pos++;

    // Place item; the displaced value becomes the new item (line 9)
    [item, arr[pos]] = [arr[pos], item];
    swaps++;
    steps.push({
      array: [...arr],
      activeLine: 9,
      highlights: { swapping: [start, pos] },
      operations: { comparisons, swaps },
      metadata: { i: start, minIdx: pos, key: item },
    });

    // Rotate the rest of the cycle (line 10)
    while (pos !== start) {
      pos = findPos(start, item, 13);
      while (item === arr[pos]) pos++;

      [item, arr[pos]] = [arr[pos], item];
      swaps++;
      steps.push({
        array: [...arr],
        activeLine: 15,
        highlights: { swapping: [start, pos] },
        operations: { comparisons, swaps },
        metadata: { i: start, minIdx: pos, key: item },
      });
    }
  }

  // Final step: fully sorted (line 18)
  steps.push({
    array: [...arr],
    activeLine: 18,
    highlights: { sorted: Array.from({ length: n }, (_, k) => k) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const cycleSort: Algorithm = {
  id: 'cycle',
  name: 'Cycle Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
};
