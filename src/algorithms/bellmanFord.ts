import type { Graph, GraphStep, GraphAlgorithm } from '../types';
import { createWeightedAdjacencyList } from '../utils/graph';

const bellmanFordCode = `void bellmanFord(graph, start) {
  for each v: dist[v] = INF, prev[v] = null
  dist[start] = 0

  for (int i = 1; i < V; i++) {
    bool changed = false;
    for each edge (u, v, w) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
        changed = true;
      }
    }
    if (!changed) break;   // early exit once stable
  }
}`;

// Line numbers (1-indexed) for activeLine highlights:
// 1  void bellmanFord(graph, start) {
// 2    for each v: dist[v] = INF, prev[v] = null
// 3    dist[start] = 0
// 4  (blank)
// 5    for (int i = 1; i < V; i++) {
// 6      bool changed = false;
// 7      for each edge (u, v, w) {
// 8        if (dist[u] + w < dist[v]) {
// 9          dist[v] = dist[u] + w;
// 10         prev[v] = u;
// 11         changed = true;
// 12       }
// 13     }
// 14     if (!changed) break;
// 15   }
// 16 }

/**
 * Generate visualization steps for the Bellman-Ford shortest-path algorithm.
 *
 * Relaxes every edge up to V-1 times. The graph is undirected, so each edge
 * is relaxable in both directions. With non-negative weights it converges
 * quickly; the early-exit guard stops once an iteration makes no change.
 *
 * Time Complexity: O(V · E)
 * Space Complexity: O(V)
 */
export function generateBellmanFordSteps(graph: Graph, startNode: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const adjacency = createWeightedAdjacencyList(graph);

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });
  distances[startNode] = 0;

  const finiteNodes = () => graph.nodes.filter(n => distances[n.id] !== Infinity).map(n => n.id);

  // Directed view of the undirected edges (both orientations relaxable)
  const directedEdges: Array<{ u: string; v: string; w: number }> = [];
  adjacency.forEach((neighbors, u) => {
    neighbors.forEach(({ node: v, weight: w }) => directedEdges.push({ u, v, w }));
  });

  // Step 0: initialise distances (lines 2-3)
  steps.push({
    graph,
    activeLine: 3,
    highlights: { visiting: [startNode], visited: [], path: [] },
    metadata: { currentNode: startNode, startNode, distances: { ...distances }, previous: { ...previous } },
  });

  const V = graph.nodes.length;
  for (let i = 1; i < V; i++) {
    let changed = false;

    for (const { u, v, w } of directedEdges) {
      // Unreachable source contributes nothing
      if (distances[u] === Infinity) continue;

      // Line 8: examine the edge
      steps.push({
        graph,
        activeLine: 8,
        highlights: {
          current: [u],
          visiting: [v],
          visited: finiteNodes(),
          path: [],
        },
        metadata: { currentNode: u, startNode, distances: { ...distances }, previous: { ...previous } },
      });

      if (distances[u] + w < distances[v]) {
        distances[v] = distances[u] + w;
        previous[v] = u;
        changed = true;

        // Lines 9-10: relax the edge
        steps.push({
          graph,
          activeLine: 9,
          highlights: {
            current: [u],
            visiting: [v],
            visited: finiteNodes(),
            path: [],
          },
          metadata: { currentNode: v, startNode, distances: { ...distances }, previous: { ...previous } },
        });
      }
    }

    // Line 14: no change this pass — distances are final
    if (!changed) {
      steps.push({
        graph,
        activeLine: 14,
        highlights: { visiting: [], visited: finiteNodes(), path: [] },
        metadata: { currentNode: undefined, startNode, distances: { ...distances }, previous: { ...previous } },
      });
      break;
    }
  }

  // Final step: shortest paths computed
  steps.push({
    graph,
    activeLine: 16,
    highlights: { visiting: [], visited: finiteNodes(), path: finiteNodes() },
    metadata: { currentNode: undefined, startNode, distances: { ...distances }, previous: { ...previous } },
  });

  return steps;
}

const bellmanFordAlgorithm: GraphAlgorithm = {
  id: 'bellmanford',
  name: 'Bellman-Ford',
  generateSteps: generateBellmanFordSteps,
  code: bellmanFordCode,
};

export default bellmanFordAlgorithm;
