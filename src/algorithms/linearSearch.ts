import type { Algorithm, Step } from '../types';

/**
 * Linear Search C++ Code
 * 
 * Line mapping:
 * 1: int linearSearch(int arr[], int n, int target) {
 * 2:   for (int i = 0; i < n; i++) {
 * 3:     if (arr[i] == target) {
 * 4:       return i;
 * 5:     }
 * 6:   }
 * 7:   return -1;
 * 8: }
 */
const code = `int linearSearch(int arr[], int n, int target) {
  for (int i = 0; i < n; i++) {
    if (arr[i] == target) {
      return i;
    }
  }
  return -1;
}`;

/**
 * Generate visualization steps for Linear Search algorithm
 * 
 * @param array - Input array to search
 * @param target - Target value to find (defaults to random element from array)
 * @returns Array of Step objects representing each state
 * 
 * Algorithm:
 * - Start from the first element
 * - Compare each element with target sequentially
 * - If element matches target, return index
 * - If no match found, return -1
 * 
 * Time Complexity: O(n)
 * Space Complexity: O(1) - only step storage for visualization
 */
function generateSteps(array: number[], target?: number): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  let comparisons = 0;
  const n = arr.length;

  // If no target specified, pick a random element from array
  const searchTarget = target !== undefined ? target : arr[Math.floor(Math.random() * n)];

  // Step 0: Initial state - function entry (line 1)
  steps.push({
    array: [...arr],
    activeLine: 1,
    highlights: {},
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });

  // Linear search loop
  for (let i = 0; i < n; i++) {
    // Step: Compare current element with target (line 3)
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 3,
      highlights: { comparing: [i] },
      operations: { comparisons, swaps: 0 },
      metadata: { target: searchTarget, found: false, foundIndex: -1, currentIndex: i },
    });

    // Check if element matches target
    if (arr[i] === searchTarget) {
      // Step: Found target - return index (line 4)
      steps.push({
        array: [...arr],
        activeLine: 4,
        highlights: { sorted: [i] }, // Use 'sorted' for found element (green)
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: true, foundIndex: i, currentIndex: i },
      });

      // Final step: Function end with success
      steps.push({
        array: [...arr],
        activeLine: 8,
        highlights: { sorted: [i] },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: true, foundIndex: i },
      });

      return steps;
    }
  }

  // Step: Target not found - return -1 (line 7)
  steps.push({
    array: [...arr],
    activeLine: 7,
    highlights: {},
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });

  // Final step: Function end with failure
  steps.push({
    array: [...arr],
    activeLine: 8,
    highlights: {},
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });

  return steps;
}

export const linearSearch: Algorithm = {
  id: 'linear',
  name: 'Linear Search',
  generateSteps,
  code,
};
