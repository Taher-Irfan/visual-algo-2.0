import type { Algorithm, Step } from '../types';

/**
 * Selection Sort C++ Code
 * 
 * Line mapping:
 * 1: void selectionSort(int arr[], int n) {
 * 2:   for (int i = 0; i < n - 1; i++) {
 * 3:     int minIdx = i;
 * 4:     for (int j = i + 1; j < n; j++) {
 * 5:       if (arr[j] < arr[minIdx]) {
 * 6:         minIdx = j;
 * 7:       }
 * 8:     }
 * 9:     swap(arr[i], arr[minIdx]);
 * 10:   }
 * 11: }
 */
const code = `void selectionSort(int arr[], int n) {
  for (int i = 0; i < n - 1; i++) {
    int minIdx = i;
    for (int j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    swap(arr[i], arr[minIdx]);
  }
}`;

/**
 * Generate visualization steps for Selection Sort algorithm
 * 
 * @param array - Input array to sort
 * @returns Array of Step objects representing each state
 * 
 * Algorithm:
 * - Find the minimum element in unsorted portion
 * - Swap it with the first unsorted element
 * - Move boundary of sorted portion one element to the right
 * - Repeat until array is sorted
 * 
 * Time Complexity: O(n²)
 * Space Complexity: O(1) - only step storage for visualization
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array]; // Create copy to avoid mutating input
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

  // Outer loop: i from 0 to n-2
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    // Step: Initialize minIdx (line 3)
    steps.push({
      array: [...arr],
      activeLine: 3,
      highlights: { comparing: [i] },
      operations: { comparisons, swaps },
      metadata: { i, minIdx },
    });

    // Inner loop: j from i+1 to n-1
    for (let j = i + 1; j < n; j++) {
      // Step: Compare arr[j] with current minimum (line 5)
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: 5,
        highlights: { comparing: [j, minIdx] },
        operations: { comparisons, swaps },
        metadata: { i, j, minIdx },
      });

      // If found new minimum, update minIdx
      if (arr[j] < arr[minIdx]) {
        minIdx = j;

        // Step: Update minIdx (line 6)
        steps.push({
          array: [...arr],
          activeLine: 6,
          highlights: { comparing: [minIdx] },
          operations: { comparisons, swaps },
          metadata: { i, j, minIdx },
        });
      }
    }

    // Step: Swap elements (line 9)
    // Always swap (even if minIdx === i) to match algorithm behavior
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    if (minIdx !== i) {
      swaps++;
    }
    steps.push({
      array: [...arr],
      activeLine: 9,
      highlights: { swapping: [i, minIdx] },
      operations: { comparisons, swaps },
      metadata: { i, minIdx },
    });

    // Step: Mark sorted portion (line 2 - outer loop continues)
    // After each iteration, elements [0..i] are in sorted position
    steps.push({
      array: [...arr],
      activeLine: 2,
      highlights: { sorted: Array.from({ length: i + 1 }, (_, k) => k) },
      operations: { comparisons, swaps },
      metadata: { i },
    });
  }

  // Final step: All elements sorted (line 11 - function end)
  steps.push({
    array: [...arr],
    activeLine: 11,
    highlights: { sorted: Array.from({ length: n }, (_, i) => i) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const selectionSort: Algorithm = {
  id: 'selection',
  name: 'Selection Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    space: 'O(1)',
  },
};
