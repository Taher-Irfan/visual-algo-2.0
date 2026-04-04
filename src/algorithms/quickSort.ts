import type { Algorithm, Step } from '../types';

/**
 * Quick Sort C++ Code
 * 
 * Line mapping:
 * 1: int partition(int arr[], int low, int high) {
 * 2:   int pivot = arr[high];
 * 3:   int i = low - 1;
 * 4:   for (int j = low; j < high; j++) {
 * 5:     if (arr[j] < pivot) {
 * 6:       i++;
 * 7:       swap(arr[i], arr[j]);
 * 8:     }
 * 9:   }
 * 10:   swap(arr[i + 1], arr[high]);
 * 11:   return i + 1;
 * 12: }
 * 13: void quickSort(int arr[], int low, int high) {
 * 14:   if (low < high) {
 * 15:     int pi = partition(arr, low, high);
 * 16:     quickSort(arr, low, pi - 1);
 * 17:     quickSort(arr, pi + 1, high);
 * 18:   }
 * 19: }
 */
const code = `int partition(int arr[], int low, int high) {
  int pivot = arr[high];
  int i = low - 1;
  for (int j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      swap(arr[i], arr[j]);
    }
  }
  swap(arr[i + 1], arr[high]);
  return i + 1;
}
void quickSort(int arr[], int low, int high) {
  if (low < high) {
    int pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}`;

/**
 * Generate visualization steps for Quick Sort algorithm
 * 
 * @param array - Input array to sort
 * @returns Array of Step objects representing each state
 * 
 * Algorithm:
 * - Pick a pivot element (last element)
 * - Partition array: elements smaller than pivot go left, larger go right
 * - Recursively sort left and right partitions
 * - Continue until array is sorted
 * 
 * Time Complexity: O(n log n) average, O(n²) worst
 * Space Complexity: O(log n) - recursion stack
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  // Step 0: Initial state - function entry (line 13)
  steps.push({
    array: [...arr],
    activeLine: 13,
    highlights: {},
    operations: { comparisons, swaps },
  });

  function partition(low: number, high: number): number {
    const pivot = arr[high];

    // Step: Select pivot (line 2)
    steps.push({
      array: [...arr],
      activeLine: 2,
      highlights: { comparing: [high] },
      operations: { comparisons, swaps },
    });

    let i = low - 1;

    // Step: Initialize i (line 3)
    steps.push({
      array: [...arr],
      activeLine: 3,
      highlights: { comparing: [high] },
      operations: { comparisons, swaps },
    });

    for (let j = low; j < high; j++) {
      // Step: Compare arr[j] with pivot (line 5)
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: 5,
        highlights: { comparing: [j, high] },
        operations: { comparisons, swaps },
      });

      if (arr[j] < pivot) {
        i++;

        // Step: Swap elements (line 7)
        [arr[i], arr[j]] = [arr[j], arr[i]];
        swaps++;
        steps.push({
          array: [...arr],
          activeLine: 7,
          highlights: { swapping: [i, j] },
          operations: { comparisons, swaps },
        });
      }
    }

    // Step: Place pivot in correct position (line 10)
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    swaps++;
    steps.push({
      array: [...arr],
      activeLine: 10,
      highlights: { swapping: [i + 1, high] },
      operations: { comparisons, swaps },
    });

    // Step: Mark pivot as sorted (line 11)
    steps.push({
      array: [...arr],
      activeLine: 11,
      highlights: { sorted: [i + 1] },
      operations: { comparisons, swaps },
    });

    return i + 1;
  }

  function quickSortHelper(low: number, high: number, sortedIndices: Set<number>) {
    // Step: Check base case (line 14)
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 14,
      highlights: { 
        comparing: low <= high ? [low, high] : [],
        sorted: Array.from(sortedIndices)
      },
      operations: { comparisons, swaps },
    });

    if (low < high) {
      // Step: Call partition (line 15)
      steps.push({
        array: [...arr],
        activeLine: 15,
        highlights: { 
          comparing: [low, high],
          sorted: Array.from(sortedIndices)
        },
        operations: { comparisons, swaps },
      });

      const pi = partition(low, high);
      sortedIndices.add(pi);

      // Recursively sort left partition
      quickSortHelper(low, pi - 1, sortedIndices);

      // Recursively sort right partition
      quickSortHelper(pi + 1, high, sortedIndices);
    } else if (low === high) {
      // Single element is already sorted
      sortedIndices.add(low);
    }
  }

  const sortedIndices = new Set<number>();
  quickSortHelper(0, n - 1, sortedIndices);

  // Final step: All elements sorted (line 19)
  steps.push({
    array: [...arr],
    activeLine: 19,
    highlights: { sorted: Array.from({ length: n }, (_, i) => i) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const quickSort: Algorithm = {
  id: 'quick',
  name: 'Quick Sort',
  generateSteps,
  code,
};
