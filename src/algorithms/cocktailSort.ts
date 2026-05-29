import type { Algorithm, Step } from '../types';

/**
 * Cocktail Shaker Sort C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void cocktailSort(int arr[], int n) {
 * 2:    bool swapped = true;
 * 3:    int start = 0, end = n - 1;
 * 4:    while (swapped) {
 * 5:      swapped = false;
 * 6:      for (int i = start; i < end; i++)
 * 7:        if (arr[i] > arr[i + 1]) {
 * 8:          swap(arr[i], arr[i + 1]); swapped = true;
 * 9:        }
 * 10:     end--;
 * 11:     for (int i = end - 1; i >= start; i--)
 * 12:       if (arr[i] > arr[i + 1]) {
 * 13:         swap(arr[i], arr[i + 1]); swapped = true;
 * 14:       }
 * 15:     start++;
 * 16:   }
 * 17: }
 */
const code = `void cocktailSort(int arr[], int n) {
  bool swapped = true;
  int start = 0, end = n - 1;
  while (swapped) {
    swapped = false;
    for (int i = start; i < end; i++)
      if (arr[i] > arr[i + 1]) {
        swap(arr[i], arr[i + 1]); swapped = true;
      }
    end--;
    for (int i = end - 1; i >= start; i--)
      if (arr[i] > arr[i + 1]) {
        swap(arr[i], arr[i + 1]); swapped = true;
      }
    start++;
  }
}`;

/**
 * Generate visualization steps for Cocktail Shaker Sort
 *
 * Algorithm:
 * - A bidirectional bubble sort: bubbles the largest element to the end on a
 *   forward pass, then the smallest to the front on a backward pass
 * - The sorted region grows from both ends toward the middle
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

  const sorted = new Set<number>();
  const sortedArr = () => Array.from(sorted);

  // Step 0: function entry (line 1)
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps },
  });

  let swapped = true;
  let start = 0;
  let end = n - 1;

  while (swapped) {
    swapped = false;

    // Forward pass: bubble the largest toward the end (line 6)
    for (let i = start; i < end; i++) {
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: 7,
        highlights: { comparing: [i, i + 1], sorted: sortedArr() },
        operations: { comparisons, swaps },
        metadata: { i, j: i + 1 },
      });

      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swaps++;
        swapped = true;
        steps.push({
          array: [...arr],
          activeLine: 8,
          highlights: { swapping: [i, i + 1], sorted: sortedArr() },
          operations: { comparisons, swaps },
          metadata: { i, j: i + 1 },
        });
      }
    }

    // Largest in this range is now at `end`
    sorted.add(end);
    end--;
    steps.push({
      array: [...arr],
      activeLine: 10,
      highlights: { sorted: sortedArr() },
      operations: { comparisons, swaps },
      metadata: { i: end },
    });

    if (!swapped) break;
    swapped = false;

    // Backward pass: bubble the smallest toward the start (line 11)
    for (let i = end - 1; i >= start; i--) {
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: 12,
        highlights: { comparing: [i, i + 1], sorted: sortedArr() },
        operations: { comparisons, swaps },
        metadata: { i, j: i + 1 },
      });

      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swaps++;
        swapped = true;
        steps.push({
          array: [...arr],
          activeLine: 13,
          highlights: { swapping: [i, i + 1], sorted: sortedArr() },
          operations: { comparisons, swaps },
          metadata: { i, j: i + 1 },
        });
      }
    }

    // Smallest in this range is now at `start`
    sorted.add(start);
    start++;
    steps.push({
      array: [...arr],
      activeLine: 15,
      highlights: { sorted: sortedArr() },
      operations: { comparisons, swaps },
      metadata: { i: start },
    });
  }

  // Final step: fully sorted (line 17)
  steps.push({
    array: [...arr],
    activeLine: 17,
    highlights: { sorted: Array.from({ length: n }, (_, k) => k) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const cocktailSort: Algorithm = {
  id: 'cocktail',
  name: 'Cocktail Shaker Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
};
