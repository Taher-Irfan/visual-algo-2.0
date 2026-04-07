import type { Algorithm, Step } from '../types';

/**
 * Insertion Sort C++ Code
 * 
 * Line mapping:
 * 1: void insertionSort(int arr[], int n) {
 * 2:   for (int i = 1; i < n; i++) {
 * 3:     int key = arr[i];
 * 4:     int j = i - 1;
 * 5:     while (j >= 0 && arr[j] > key) {
 * 6:       arr[j + 1] = arr[j];
 * 7:       j--;
 * 8:     }
 * 9:     arr[j + 1] = key;
 * 10:   }
 * 11: }
 */
const code = `void insertionSort(int arr[], int n) {
  for (int i = 1; i < n; i++) {
    int key = arr[i];
    int j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}`;

/**
 * Generate visualization steps for Insertion Sort algorithm
 * 
 * @param array - Input array to sort
 * @returns Array of Step objects representing each state
 * 
 * Algorithm:
 * - Build sorted array one element at a time
 * - Pick element and insert it into correct position in sorted portion
 * - Shift larger elements one position to the right
 * - Continue until array is sorted
 * 
 * Time Complexity: O(n²)
 * Space Complexity: O(1) - only step storage for visualization
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  // Step 0: Initial state - function entry (line 1)
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps },
  });

  // Outer loop: i from 1 to n-1
  for (let i = 1; i < n; i++) {
    const key = arr[i];

    // Step: Pick key element (line 3)
    steps.push({
      array: [...arr],
      activeLine: 3,
      highlights: { comparing: [i] },
      operations: { comparisons, swaps },
      metadata: { i, key },
    });

    let j = i - 1;

    // Step: Initialize j (line 4)
    steps.push({
      array: [...arr],
      activeLine: 4,
      highlights: { comparing: [i, j] },
      operations: { comparisons, swaps },
      metadata: { i, j, key },
    });

    // Inner loop: shift elements greater than key
    while (j >= 0 && arr[j] > key) {
      // Step: Compare arr[j] with key (line 5)
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: 5,
        highlights: { comparing: [j, i] },
        operations: { comparisons, swaps },
        metadata: { i, j, key },
      });

      // Step: Shift element to the right (line 6)
      arr[j + 1] = arr[j];
      swaps++;
      steps.push({
        array: [...arr],
        activeLine: 6,
        highlights: { swapping: [j, j + 1] },
        operations: { comparisons, swaps },
        metadata: { i, j, key },
      });

      j--;
    }

    // Final comparison if loop exited due to condition
    if (j >= 0) {
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: 5,
        highlights: { comparing: [j, i] },
        operations: { comparisons, swaps },
        metadata: { i, j, key },
      });
    }

    // Step: Insert key at correct position (line 9)
    arr[j + 1] = key;
    steps.push({
      array: [...arr],
      activeLine: 9,
      highlights: { swapping: [j + 1] },
      operations: { comparisons, swaps },
      metadata: { i, j, key },
    });

    // Step: Mark sorted portion (line 2)
    steps.push({
      array: [...arr],
      activeLine: 2,
      highlights: { sorted: Array.from({ length: i + 1 }, (_, k) => k) },
      operations: { comparisons, swaps },
      metadata: { i },
    });
  }

  // Final step: All elements sorted (line 11)
  steps.push({
    array: [...arr],
    activeLine: 11,
    highlights: { sorted: Array.from({ length: n }, (_, i) => i) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const insertionSort: Algorithm = {
  id: 'insertion',
  name: 'Insertion Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
};
