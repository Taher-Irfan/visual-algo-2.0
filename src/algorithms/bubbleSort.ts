import type { Algorithm, Step } from '../types';

/**
 * C++ code for Bubble Sort
 * Line mapping:
 * 1: void bubbleSort(int arr[], int n) {
 * 2:   for (int i = 0; i < n - 1; i++) {
 * 3:     for (int j = 0; j < n - i - 1; j++) {
 * 4:       if (arr[j] > arr[j + 1]) {
 * 5:         swap(arr[j], arr[j + 1]);
 * 6:       }
 * 7:     }
 * 8:   }
 * 9: }
 */
const code = `void bubbleSort(int arr[], int n) {
  for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr[j], arr[j + 1]);
      }
    }
  }
}`;

/**
 * Generate visualization steps for Bubble Sort algorithm
 * 
 * @param array - Input array to sort
 * @returns Array of Step objects representing each state of the algorithm
 * 
 * Algorithm:
 * - Repeatedly compare adjacent elements
 * - Swap if they're in wrong order
 * - After each pass, the largest element "bubbles up" to the end
 * - Continue until array is sorted
 * 
 * Time Complexity: O(n²)
 * Space Complexity: O(1) - only step storage for visualization
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array]; // Create a copy to avoid mutating input
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  // Step 0: Initial state - function entry
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps },
  });

  // Outer loop: i from 0 to n-2
  for (let i = 0; i < n - 1; i++) {
    // Inner loop: j from 0 to n-i-2
    for (let j = 0; j < n - i - 1; j++) {
      // Step: Compare adjacent elements (line 4: if condition)
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: 4,
        highlights: { comparing: [j, j + 1] },
        operations: { comparisons, swaps },
      });

      // If elements are in wrong order, swap them
      if (arr[j] > arr[j + 1]) {
        // Step: Swap elements (line 5: swap operation)
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        steps.push({
          array: [...arr],
          activeLine: 5,
          highlights: { swapping: [j, j + 1] },
          operations: { comparisons, swaps },
        });
      }
    }

    // Step: Mark elements as sorted after each outer loop iteration
    // After pass i, the last (i+1) elements are in their final sorted positions
    steps.push({
      array: [...arr],
      activeLine: 2,
      highlights: { 
        sorted: Array.from({ length: i + 1 }, (_, k) => n - 1 - k) 
      },
      operations: { comparisons, swaps },
    });
  }

  // Final step: All elements sorted (line 9: function end)
  steps.push({
    array: [...arr],
    activeLine: 9,
    highlights: { 
      sorted: Array.from({ length: n }, (_, i) => i) 
    },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const bubbleSort: Algorithm = {
  id: 'bubble',
  name: 'Bubble Sort',
  generateSteps,
  code,
};
