import type { Algorithm } from '../types';
import { bubbleSort } from './bubbleSort';
import { selectionSort } from './selectionSort';
import { insertionSort } from './insertionSort';
import { quickSort } from './quickSort';
import { mergeSort } from './mergeSort';
import { heapSort } from './heapSort';
import { shellSort } from './shellSort';
import { cocktailSort } from './cocktailSort';
import { gnomeSort } from './gnomeSort';
import { countingSort } from './countingSort';
import { radixSort } from './radixSort';
import { linearSearch } from './linearSearch';
import { binarySearch } from './binarySearch';
import { jumpSearch } from './jumpSearch';
import { exponentialSearch } from './exponentialSearch';
import { ternarySearch } from './ternarySearch';
import { interpolationSearch } from './interpolationSearch';

// Legacy export for backward compatibility
export const algorithms: Record<string, Algorithm> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  quick: quickSort,
  merge: mergeSort,
  heap: heapSort,
  shell: shellSort,
  cocktail: cocktailSort,
  gnome: gnomeSort,
  counting: countingSort,
  radix: radixSort,
  linear: linearSearch,
  binary: binarySearch,
  jump: jumpSearch,
  exponential: exponentialSearch,
  ternary: ternarySearch,
  interpolation: interpolationSearch,
};

// Re-export registry utilities
export * from './registry';
