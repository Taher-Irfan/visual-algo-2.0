import type { Algorithm } from '../types';
import { bubbleSort } from './bubbleSort';
import { selectionSort } from './selectionSort';
import { insertionSort } from './insertionSort';
import { quickSort } from './quickSort';
import { mergeSort } from './mergeSort';
import { linearSearch } from './linearSearch';
import { binarySearch } from './binarySearch';

export type AlgorithmCategory = 'sorting' | 'searching' | 'graph' | 'tree';

export interface CategoryAlgorithms {
  [algorithmId: string]: Algorithm;
}

export interface AlgorithmRegistry {
  [category: string]: CategoryAlgorithms;
}

/**
 * Centralized Algorithm Registry
 * Maps category + algorithm ID to implementation and code
 * 
 * Structure:
 * {
 *   sorting: {
 *     bubble: { id, name, generateSteps, code },
 *     selection: { ... },
 *     ...
 *   },
 *   searching: {
 *     linear: { ... },
 *     binary: { ... }
 *   },
 *   graph: {
 *     bfs: { ... },
 *     dfs: { ... }
 *   }
 * }
 */
export const algorithmRegistry: AlgorithmRegistry = {
  sorting: {
    bubble: bubbleSort,
    selection: selectionSort,
    insertion: insertionSort,
    quick: quickSort,
    merge: mergeSort,
  },
  searching: {
    linear: linearSearch,
    binary: binarySearch,
  },
  graph: {
    // Placeholder for future implementations
    // bfs: breadthFirstSearch,
    // dfs: depthFirstSearch,
  },
};

/**
 * Get algorithm by category and ID
 */
export function getAlgorithm(category: AlgorithmCategory, algorithmId: string): Algorithm | undefined {
  return algorithmRegistry[category]?.[algorithmId];
}

/**
 * Get all algorithms for a category
 */
export function getAlgorithmsByCategory(category: AlgorithmCategory): CategoryAlgorithms {
  return algorithmRegistry[category] || {};
}

/**
 * Get all algorithm IDs for a category
 */
export function getAlgorithmIds(category: AlgorithmCategory): string[] {
  return Object.keys(algorithmRegistry[category] || {});
}

/**
 * Get algorithm names for dropdown/UI
 */
export function getAlgorithmOptions(category: AlgorithmCategory): Array<{ id: string; name: string }> {
  const algorithms = getAlgorithmsByCategory(category);
  return Object.values(algorithms).map(algo => ({
    id: algo.id,
    name: algo.name,
  }));
}

/**
 * Get default algorithm for a category
 */
export function getDefaultAlgorithm(category: AlgorithmCategory): string {
  const defaultMap: Record<AlgorithmCategory, string> = {
    sorting: 'bubble',
    searching: 'linear',
    graph: 'bfs',
    tree: 'segment',
  };
  return defaultMap[category] || 'bubble';
}

/**
 * Check if an algorithm exists
 */
export function hasAlgorithm(category: AlgorithmCategory, algorithmId: string): boolean {
  return !!algorithmRegistry[category]?.[algorithmId];
}
