import type { Algorithm, Step } from '../types';

/**
 * Binary Search C++ Code
 * 
 * Line mapping:
 * 1: int binarySearch(int arr[], int n, int target) {
 * 2:   int left = 0, right = n - 1;
 * 3:   while (left <= right) {
 * 4:     int mid = left + (right - left) / 2;
 * 5:     if (arr[mid] == target) {
 * 6:       return mid;
 * 7:     }
 * 8:     if (arr[mid] < target) {
 * 9:       left = mid + 1;
 * 10:     } else {
 * 11:       right = mid - 1;
 * 12:     }
 * 13:   }
 * 14:   return -1;
 * 15: }
 */
const code = `int binarySearch(int arr[], int n, int target) {
  int left = 0, right = n - 1;
  while (left <= right) {
    int mid = left + (right - left) / 2;
    if (arr[mid] == target) {
      return mid;
    }
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`;

/**
 * Generate visualization steps for Binary Search algorithm
 * 
 * @param array - Input SORTED array to search
 * @param target - Target value to find (defaults to random element from array)
 * @returns Array of Step objects representing each state
 * 
 * Algorithm:
 * - Requires sorted array
 * - Find middle element
 * - If middle matches target, return index
 * - If middle < target, search right half
 * - If middle > target, search left half
 * - Repeat until found or search space exhausted
 * 
 * Time Complexity: O(log n)
 * Space Complexity: O(1) - only step storage for visualization
 */
function generateSteps(array: number[], target?: number): Step[] {
  const steps: Step[] = [];
  const arr = [...array].sort((a, b) => a - b); // Ensure array is sorted
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

  let left = 0;
  let right = n - 1;

  // Step: Initialize left and right (line 2)
  steps.push({
    array: [...arr],
    activeLine: 2,
    highlights: { comparing: [left, right] },
    operations: { comparisons, swaps: 0 },
    metadata: { 
      target: searchTarget, 
      found: false, 
      foundIndex: -1,
      searchRange: { left, right }
    },
  });

  // Binary search loop
  while (left <= right) {
    // Step: Check loop condition (line 3)
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 3,
      highlights: { 
        comparing: [left, right],
        // Fade elements outside search range
        swapping: Array.from({ length: n }, (_, i) => i).filter(
          i => i < left || i > right
        )
      },
      operations: { comparisons, swaps: 0 },
      metadata: { 
        target: searchTarget, 
        found: false, 
        foundIndex: -1,
        searchRange: { left, right }
      },
    });

    // Calculate mid point
    const mid = Math.floor(left + (right - left) / 2);

    // Step: Calculate mid (line 4)
    steps.push({
      array: [...arr],
      activeLine: 4,
      highlights: { 
        comparing: [mid],
        swapping: Array.from({ length: n }, (_, i) => i).filter(
          i => i < left || i > right
        )
      },
      operations: { comparisons, swaps: 0 },
      metadata: { 
        target: searchTarget, 
        found: false, 
        foundIndex: -1,
        searchRange: { left, right, mid }
      },
    });

    // Step: Compare mid with target (line 5)
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 5,
      highlights: { 
        comparing: [mid],
        swapping: Array.from({ length: n }, (_, i) => i).filter(
          i => i < left || i > right
        )
      },
      operations: { comparisons, swaps: 0 },
      metadata: { 
        target: searchTarget, 
        found: false, 
        foundIndex: -1,
        searchRange: { left, right, mid }
      },
    });

    if (arr[mid] === searchTarget) {
      // Step: Found target - return mid (line 6)
      steps.push({
        array: [...arr],
        activeLine: 6,
        highlights: { sorted: [mid] }, // Use 'sorted' for found element (green)
        operations: { comparisons, swaps: 0 },
        metadata: { 
          target: searchTarget, 
          found: true, 
          foundIndex: mid,
          searchRange: { left, right, mid }
        },
      });

      // Final step: Function end with success
      steps.push({
        array: [...arr],
        activeLine: 15,
        highlights: { sorted: [mid] },
        operations: { comparisons, swaps: 0 },
        metadata: { target: searchTarget, found: true, foundIndex: mid },
      });

      return steps;
    }

    // Step: Compare mid with target for direction (line 8)
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 8,
      highlights: { 
        comparing: [mid],
        swapping: Array.from({ length: n }, (_, i) => i).filter(
          i => i < left || i > right
        )
      },
      operations: { comparisons, swaps: 0 },
      metadata: { 
        target: searchTarget, 
        found: false, 
        foundIndex: -1,
        searchRange: { left, right, mid }
      },
    });

    if (arr[mid] < searchTarget) {
      // Target is in right half
      left = mid + 1;

      // Step: Update left pointer (line 9)
      steps.push({
        array: [...arr],
        activeLine: 9,
        highlights: { 
          comparing: [left],
          swapping: Array.from({ length: n }, (_, i) => i).filter(
            i => i < left || i > right
          )
        },
        operations: { comparisons, swaps: 0 },
        metadata: { 
          target: searchTarget, 
          found: false, 
          foundIndex: -1,
          searchRange: { left, right, mid }
        },
      });
    } else {
      // Target is in left half
      right = mid - 1;

      // Step: Update right pointer (line 11)
      steps.push({
        array: [...arr],
        activeLine: 11,
        highlights: { 
          comparing: [right >= 0 ? right : 0],
          swapping: Array.from({ length: n }, (_, i) => i).filter(
            i => i < left || i > right
          )
        },
        operations: { comparisons, swaps: 0 },
        metadata: { 
          target: searchTarget, 
          found: false, 
          foundIndex: -1,
          searchRange: { left, right, mid }
        },
      });
    }
  }

  // Step: Target not found - return -1 (line 14)
  steps.push({
    array: [...arr],
    activeLine: 14,
    highlights: {
      swapping: Array.from({ length: n }, (_, i) => i)
    },
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });

  // Final step: Function end with failure
  steps.push({
    array: [...arr],
    activeLine: 15,
    highlights: {},
    operations: { comparisons, swaps: 0 },
    metadata: { target: searchTarget, found: false, foundIndex: -1 },
  });

  return steps;
}

export const binarySearch: Algorithm = {
  id: 'binary',
  name: 'Binary Search',
  generateSteps,
  code,
};
