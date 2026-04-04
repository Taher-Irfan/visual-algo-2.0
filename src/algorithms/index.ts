import type { Algorithm } from '../types';
import { bubbleSort } from './bubbleSort';
import { selectionSort } from './selectionSort';
import { insertionSort } from './insertionSort';
import { quickSort } from './quickSort';
import { mergeSort } from './mergeSort';
import { linearSearch } from './linearSearch';
import { binarySearch } from './binarySearch';

// Legacy export for backward compatibility
export const algorithms: Record<string, Algorithm> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  quick: quickSort,
  merge: mergeSort,
  linear: linearSearch,
  binary: binarySearch,
};

// Re-export registry utilities
export * from './registry';
