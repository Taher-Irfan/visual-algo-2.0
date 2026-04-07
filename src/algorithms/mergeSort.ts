import type { Algorithm, Step } from '../types';

/**
 * Merge Sort C++ Code
 * 
 * Line mapping:
 * 1: void merge(int arr[], int l, int m, int r) {
 * 2:   int n1 = m - l + 1, n2 = r - m;
 * 3:   int L[n1], R[n2];
 * 4:   for (int i = 0; i < n1; i++) L[i] = arr[l + i];
 * 5:   for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
 * 6:   int i = 0, j = 0, k = l;
 * 7:   while (i < n1 && j < n2) {
 * 8:     if (L[i] <= R[j]) arr[k++] = L[i++];
 * 9:     else arr[k++] = R[j++];
 * 10:   }
 * 11:   while (i < n1) arr[k++] = L[i++];
 * 12:   while (j < n2) arr[k++] = R[j++];
 * 13: }
 * 14: void mergeSort(int arr[], int l, int r) {
 * 15:   if (l < r) {
 * 16:     int m = l + (r - l) / 2;
 * 17:     mergeSort(arr, l, m);
 * 18:     mergeSort(arr, m + 1, r);
 * 19:     merge(arr, l, m, r);
 * 20:   }
 * 21: }
 */
const code = `void merge(int arr[], int l, int m, int r) {
  int n1 = m - l + 1, n2 = r - m;
  int L[n1], R[n2];
  for (int i = 0; i < n1; i++) L[i] = arr[l + i];
  for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
  int i = 0, j = 0, k = l;
  while (i < n1 && j < n2) {
    if (L[i] <= R[j]) arr[k++] = L[i++];
    else arr[k++] = R[j++];
  }
  while (i < n1) arr[k++] = L[i++];
  while (j < n2) arr[k++] = R[j++];
}
void mergeSort(int arr[], int l, int r) {
  if (l < r) {
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
  }
}`;

/**
 * Generate visualization steps for Merge Sort algorithm
 * 
 * @param array - Input array to sort
 * @returns Array of Step objects representing each state
 * 
 * Algorithm:
 * - Divide array into two halves
 * - Recursively sort each half
 * - Merge the two sorted halves
 * - Continue until array is sorted
 * 
 * Time Complexity: O(n log n)
 * Space Complexity: O(n) - temporary arrays for merging
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;

  // Step 0: Initial state - function entry (line 14)
  steps.push({
    array: [...arr],
    activeLine: 14,
    highlights: {},
    operations: { comparisons, swaps },
  });

  function merge(l: number, m: number, r: number) {
    const n1 = m - l + 1;
    const n2 = r - m;

    // Step: Calculate sizes (line 2)
    steps.push({
      array: [...arr],
      activeLine: 2,
      highlights: { comparing: [l, m, r] },
      operations: { comparisons, swaps },
      metadata: { l, r, m },
    });

    // Create temp arrays
    const L = new Array(n1);
    const R = new Array(n2);

    // Copy data to temp arrays (line 4-5)
    for (let i = 0; i < n1; i++) {
      L[i] = arr[l + i];
      steps.push({
        array: [...arr],
        activeLine: 4,
        highlights: { comparing: [l + i] },
        operations: { comparisons, swaps },
        metadata: { l, r, m, i },
      });
    }

    for (let j = 0; j < n2; j++) {
      R[j] = arr[m + 1 + j];
      steps.push({
        array: [...arr],
        activeLine: 5,
        highlights: { comparing: [m + 1 + j] },
        operations: { comparisons, swaps },
        metadata: { l, r, m, j },
      });
    }

    // Merge temp arrays back
    let i = 0, j = 0, k = l;

    // Step: Initialize merge pointers (line 6)
    steps.push({
      array: [...arr],
      activeLine: 6,
      highlights: { comparing: [l] },
      operations: { comparisons, swaps },
      metadata: { l, r, m, i, j, k },
    });

    while (i < n1 && j < n2) {
      // Step: Compare elements from both halves (line 8)
      comparisons++;
      steps.push({
        array: [...arr],
        activeLine: 8,
        highlights: { comparing: [l + i, m + 1 + j] },
        operations: { comparisons, swaps },
        metadata: { l, r, m, i, j, k },
      });

      if (L[i] <= R[j]) {
        arr[k] = L[i];
        swaps++;
        steps.push({
          array: [...arr],
          activeLine: 8,
          highlights: { swapping: [k] },
          operations: { comparisons, swaps },
          metadata: { l, r, m, i, j, k },
        });
        i++;
      } else {
        arr[k] = R[j];
        swaps++;
        steps.push({
          array: [...arr],
          activeLine: 9,
          highlights: { swapping: [k] },
          operations: { comparisons, swaps },
          metadata: { l, r, m, i, j, k },
        });
        j++;
      }
      k++;
    }

    // Copy remaining elements of L[] (line 11)
    while (i < n1) {
      arr[k] = L[i];
      swaps++;
      steps.push({
        array: [...arr],
        activeLine: 11,
        highlights: { swapping: [k] },
        operations: { comparisons, swaps },
        metadata: { l, r, m, i, k },
      });
      i++;
      k++;
    }

    // Copy remaining elements of R[] (line 12)
    while (j < n2) {
      arr[k] = R[j];
      swaps++;
      steps.push({
        array: [...arr],
        activeLine: 12,
        highlights: { swapping: [k] },
        operations: { comparisons, swaps },
        metadata: { l, r, m, j, k },
      });
      j++;
      k++;
    }

    // Step: Merged subarray is now sorted (line 13)
    steps.push({
      array: [...arr],
      activeLine: 13,
      highlights: { sorted: Array.from({ length: r - l + 1 }, (_, idx) => l + idx) },
      operations: { comparisons, swaps },
      metadata: { l, r, m },
    });
  }

  function mergeSortHelper(l: number, r: number) {
    // Step: Check base case (line 15)
    comparisons++;
    steps.push({
      array: [...arr],
      activeLine: 15,
      highlights: { comparing: l <= r ? [l, r] : [] },
      operations: { comparisons, swaps },
      metadata: { l, r },
    });

    if (l < r) {
      // Step: Calculate middle (line 16)
      const m = Math.floor(l + (r - l) / 2);
      steps.push({
        array: [...arr],
        activeLine: 16,
        highlights: { comparing: [l, m, r] },
        operations: { comparisons, swaps },
        metadata: { l, r, m },
      });

      // Recursively sort first half
      mergeSortHelper(l, m);

      // Recursively sort second half
      mergeSortHelper(m + 1, r);

      // Merge the sorted halves
      merge(l, m, r);
    }
  }

  mergeSortHelper(0, n - 1);

  // Final step: All elements sorted (line 21)
  steps.push({
    array: [...arr],
    activeLine: 21,
    highlights: { sorted: Array.from({ length: n }, (_, i) => i) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const mergeSort: Algorithm = {
  id: 'merge',
  name: 'Merge Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
  },
};
