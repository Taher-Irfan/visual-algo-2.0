import type { Algorithm, Step } from '../types';

/**
 * Heap Sort C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  void heapify(int arr[], int n, int i) {
 * 2:    int largest = i;
 * 3:    int l = 2 * i + 1;
 * 4:    int r = 2 * i + 2;
 * 5:    if (l < n && arr[l] > arr[largest])
 * 6:      largest = l;
 * 7:    if (r < n && arr[r] > arr[largest])
 * 8:      largest = r;
 * 9:    if (largest != i) {
 * 10:     swap(arr[i], arr[largest]);
 * 11:     heapify(arr, n, largest);
 * 12:   }
 * 13: }
 * 14: (blank)
 * 15: void heapSort(int arr[], int n) {
 * 16:   for (int i = n / 2 - 1; i >= 0; i--)
 * 17:     heapify(arr, n, i);
 * 18:   for (int i = n - 1; i > 0; i--) {
 * 19:     swap(arr[0], arr[i]);
 * 20:     heapify(arr, i, 0);
 * 21:   }
 * 22: }
 */
const code = `void heapify(int arr[], int n, int i) {
  int largest = i;
  int l = 2 * i + 1;
  int r = 2 * i + 2;
  if (l < n && arr[l] > arr[largest])
    largest = l;
  if (r < n && arr[r] > arr[largest])
    largest = r;
  if (largest != i) {
    swap(arr[i], arr[largest]);
    heapify(arr, n, largest);
  }
}

void heapSort(int arr[], int n) {
  for (int i = n / 2 - 1; i >= 0; i--)
    heapify(arr, n, i);
  for (int i = n - 1; i > 0; i--) {
    swap(arr[0], arr[i]);
    heapify(arr, i, 0);
  }
}`;

/**
 * Generate visualization steps for Heap Sort algorithm
 *
 * @param array - Input array to sort
 * @returns Array of Step objects representing each state
 *
 * Algorithm:
 * - Build a max-heap from the array (bottom-up heapify)
 * - Repeatedly swap the root (max) with the last unsorted element
 * - Shrink the heap and sift the new root down to restore the heap property
 *
 * Time Complexity: O(n log n) in all cases
 * Space Complexity: O(1) - in-place (only step storage for visualization)
 */
function generateSteps(array: number[]): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  // Track which indices are in their final sorted position (the sorted tail)
  const sorted = new Set<number>();

  // Step 0: Initial state - heapSort entry (line 15)
  steps.push({
    array: [...arr],
    activeLine: 15,
    highlights: {},
    operations: { comparisons, swaps },
  });

  /**
   * Sift node i down within a heap of `heapSize`, emitting steps.
   * Iterative form of the recursive heapify in the displayed code.
   */
  function heapify(heapSize: number, i: number, phase: 'build-heap' | 'sort-down') {
    let current = i;

    for (;;) {
      let largest = current;
      const l = 2 * current + 1;
      const r = 2 * current + 2;

      // Line 2-4: initialize largest, compute children indices
      steps.push({
        array: [...arr],
        activeLine: 2,
        highlights: { comparing: [current], sorted: Array.from(sorted) },
        operations: { comparisons, swaps },
        metadata: { i: current, largest, heapSize, phase },
      });

      // Line 5: compare left child with current largest
      if (l < heapSize) {
        comparisons++;
        steps.push({
          array: [...arr],
          activeLine: 5,
          highlights: { comparing: [largest, l], sorted: Array.from(sorted) },
          operations: { comparisons, swaps },
          metadata: { i: current, largest, heapSize, phase },
        });
        if (arr[l] > arr[largest]) {
          largest = l;
        }
      }

      // Line 7: compare right child with current largest
      if (r < heapSize) {
        comparisons++;
        steps.push({
          array: [...arr],
          activeLine: 7,
          highlights: { comparing: [largest, r], sorted: Array.from(sorted) },
          operations: { comparisons, swaps },
          metadata: { i: current, largest, heapSize, phase },
        });
        if (arr[r] > arr[largest]) {
          largest = r;
        }
      }

      // Line 9: is the largest still the current node?
      if (largest !== current) {
        // Line 10: swap current with largest child
        [arr[current], arr[largest]] = [arr[largest], arr[current]];
        swaps++;
        steps.push({
          array: [...arr],
          activeLine: 10,
          highlights: { swapping: [current, largest], sorted: Array.from(sorted) },
          operations: { comparisons, swaps },
          metadata: { i: current, largest, heapSize, phase },
        });

        // Line 11: continue sifting down from the affected child
        current = largest;
      } else {
        // Heap property satisfied at this subtree
        break;
      }
    }
  }

  // Phase 1: Build max-heap (line 16 loop)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    steps.push({
      array: [...arr],
      activeLine: 16,
      highlights: { comparing: [i], sorted: Array.from(sorted) },
      operations: { comparisons, swaps },
      metadata: { i, heapSize: n, phase: 'build-heap' },
    });
    heapify(n, i, 'build-heap');
  }

  // Phase 2: Repeatedly extract the max (line 18 loop)
  for (let i = n - 1; i > 0; i--) {
    // Line 19: move current root (max) to the end of the heap
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++;
    sorted.add(i);
    steps.push({
      array: [...arr],
      activeLine: 19,
      highlights: { swapping: [0, i], sorted: Array.from(sorted) },
      operations: { comparisons, swaps },
      metadata: { i, heapSize: i, phase: 'sort-down' },
    });

    // Line 20: restore heap property on the reduced heap [0, i)
    heapify(i, 0, 'sort-down');
  }

  // Element at index 0 is now in place too
  sorted.add(0);

  // Final step: array fully sorted (line 22)
  steps.push({
    array: [...arr],
    activeLine: 22,
    highlights: { sorted: Array.from({ length: n }, (_, k) => k) },
    operations: { comparisons, swaps },
  });

  return steps;
}

export const heapSort: Algorithm = {
  id: 'heap',
  name: 'Heap Sort',
  generateSteps,
  code,
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(1)',
  },
};
