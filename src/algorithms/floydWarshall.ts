import type { Graph, GraphStep, GraphAlgorithm } from '../types';
import { createWeightedAdjacencyList } from '../utils/graph';

const floydWarshallCode = `void floydWarshall(graph) {
  // dist[i][j] = direct edge weight, 0 on diagonal, INF otherwise
  init dist[][] from edges

  for (int k = 0; k < V; k++)
    for (int i = 0; i < V; i++)
      for (int j = 0; j < V; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j])
          dist[i][j] = dist[i][k] + dist[k][j];
}`;

// Line numbers (1-indexed) for activeLine highlights:
// 1  void floydWarshall(graph) {
// 2    // dist[i][j] = direct edge weight, 0 on diagonal, INF otherwise
// 3    init dist[][] from edges
// 4  (blank)
// 5    for (int k = 0; k < V; k++)
// 6      for (int i = 0; i < V; i++)
// 7        for (int j = 0; j < V; j++)
// 8          if (dist[i][k] + dist[k][j] < dist[i][j])
// 9            dist[i][j] = dist[i][k] + dist[k][j];
// 10 }

/**
 * Generate visualization steps for the Floyd-Warshall all-pairs shortest-path
 * algorithm.
 *
 * The algorithm computes the full V×V distance matrix; for visualization we
 * surface the row originating at `startNode` (shown as node labels and in the
 * distances table) and highlight the current intermediate node k. Updates that
 * improve a distance from the start node are emitted as steps.
 *
 * Time Complexity: O(V³)
 * Space Complexity: O(V²)
 */
export function generateFloydWarshallSteps(graph: Graph, startNode: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const adjacency = createWeightedAdjacencyList(graph);
  const ids = graph.nodes.map(n => n.id);

  // Initialise the distance matrix
  const dist: Record<string, Record<string, number>> = {};
  ids.forEach(i => {
    dist[i] = {};
    ids.forEach(j => {
      dist[i][j] = i === j ? 0 : Infinity;
    });
  });
  adjacency.forEach((neighbors, u) => {
    neighbors.forEach(({ node: v, weight: w }) => {
      if (w < dist[u][v]) dist[u][v] = w;
    });
  });

  // Distances from the start node — the row we surface to the UI
  const startRow = () => ({ ...dist[startNode] });
  const finiteFromStart = () => ids.filter(j => dist[startNode][j] !== Infinity);

  // Step 0: matrix initialised (line 3)
  steps.push({
    graph,
    activeLine: 3,
    highlights: { visiting: [startNode], visited: [], path: [] },
    metadata: { currentNode: startNode, startNode, distances: startRow() },
  });

  for (const k of ids) {
    // Line 5: choose intermediate node k
    steps.push({
      graph,
      activeLine: 5,
      highlights: {
        current: [k],
        visited: finiteFromStart(),
        path: [],
      },
      metadata: { currentNode: k, startNode, distances: startRow() },
    });

    for (const i of ids) {
      for (const j of ids) {
        if (dist[i][k] === Infinity || dist[k][j] === Infinity) continue;
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];

          // Only surface improvements to the displayed start row (line 9)
          if (i === startNode) {
            steps.push({
              graph,
              activeLine: 9,
              highlights: {
                current: [k],
                visiting: [j],
                visited: finiteFromStart(),
                path: [],
              },
              metadata: { currentNode: k, startNode, distances: startRow() },
            });
          }
        }
      }
    }
  }

  // Final step: all-pairs distances computed
  steps.push({
    graph,
    activeLine: 10,
    highlights: { visiting: [], visited: finiteFromStart(), path: finiteFromStart() },
    metadata: { currentNode: undefined, startNode, distances: startRow() },
  });

  return steps;
}

const floydWarshallAlgorithm: GraphAlgorithm = {
  id: 'floyd',
  name: 'Floyd-Warshall',
  generateSteps: generateFloydWarshallSteps,
  code: floydWarshallCode,
};

export default floydWarshallAlgorithm;
