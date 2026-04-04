import type { GraphAlgorithm } from '../types';
import bfsAlgorithm from './bfs';
import dfsAlgorithm from './dfs';
import dijkstraAlgorithm from './dijkstra';
import primAlgorithm from './prim';

export interface GraphAlgorithmRegistry {
  [algorithmId: string]: GraphAlgorithm;
}

export const graphAlgorithmRegistry: GraphAlgorithmRegistry = {
  bfs: bfsAlgorithm,
  dfs: dfsAlgorithm,
  dijkstra: dijkstraAlgorithm,
  prim: primAlgorithm,
};

export function getGraphAlgorithm(algorithmId: string): GraphAlgorithm | undefined {
  return graphAlgorithmRegistry[algorithmId];
}

export function getGraphAlgorithmOptions(): Array<{ id: string; name: string }> {
  return Object.values(graphAlgorithmRegistry).map(algo => ({
    id: algo.id,
    name: algo.name,
  }));
}

export function getDefaultGraphAlgorithm(): string {
  return 'bfs';
}
