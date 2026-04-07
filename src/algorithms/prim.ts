import type { Graph, GraphStep, GraphAlgorithm } from '../types';
import { createWeightedAdjacencyList } from '../utils/graph';

const primCode = `void prim(graph, start):
  inMST = {}
  key    = {v: INF for each v}
  parent = {v: null for each v}
  key[start] = 0
  pq.push(0, start)

  while pq is not empty:
    (w, u) = pq.pop_min()

    if u in inMST: continue

    inMST.add(u)
    // add edge parent[u]→u to MST

    for (v, weight) in neighbors(u):
      if v not in inMST and weight < key[v]:
        key[v]    = weight
        parent[v] = u
        pq.push(weight, v)

  return MST edges via parent[]`;

// Line numbers (1-indexed) for activeLine highlights:
// 1  void prim(graph, start):
// 2    inMST = {}
// 3    key    = {v: INF for each v}
// 4    parent = {v: null for each v}
// 5    key[start] = 0
// 6    pq.push(0, start)
// 7  (blank)
// 8    while pq is not empty:
// 9      (w, u) = pq.pop_min()
// 10   (blank)
// 11     if u in inMST: continue
// 12   (blank)
// 13     inMST.add(u)
// 14     // add edge parent[u]→u to MST
// 15   (blank)
// 16     for (v, weight) in neighbors(u):
// 17       if v not in inMST and weight < key[v]:
// 18         key[v]    = weight
// 19         parent[v] = u
// 20         pq.push(weight, v)
// 21  (blank)
// 22   return MST edges via parent[]

export function generatePrimSteps(graph: Graph, startNode: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const adjacencyList = createWeightedAdjacencyList(graph);
  const inMST = new Set<string>();
  const key: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  const mstEdges: Array<{ source: string; target: string }> = [];

  graph.nodes.forEach(node => {
    key[node.id] = Infinity;
    parent[node.id] = null;
  });

  key[startNode] = 0;

  const pq: Array<{ node: string; weight: number }> = [{ node: startNode, weight: 0 }];

  // Initial step: set key[start] = 0, push to PQ
  steps.push({
    graph,
    activeLine: 5,
    highlights: { visiting: [startNode], visited: [], path: [], mstEdges: [] },
    metadata: { queue: [startNode], currentNode: startNode, startNode, keys: { ...key } },
  });

  while (pq.length > 0) {
    pq.sort((a, b) => a.weight - b.weight);
    const { node: current } = pq.shift()!;

    // Step: pop min from PQ
    steps.push({
      graph,
      activeLine: 9,
      highlights: {
        visiting: [current],
        visited: Array.from(inMST),
        path: Array.from(inMST),
        mstEdges: mstEdges.map(e => ({ ...e })),
      },
      metadata: { queue: pq.map(p => p.node), currentNode: current, startNode, keys: { ...key } },
    });

    if (inMST.has(current)) {
      // Step: skip — already in MST
      steps.push({
        graph,
        activeLine: 11,
        highlights: {
          visiting: [],
          visited: Array.from(inMST),
          path: Array.from(inMST),
          mstEdges: mstEdges.map(e => ({ ...e })),
        },
        metadata: { queue: pq.map(p => p.node), currentNode: current, startNode, keys: { ...key } },
      });
      continue;
    }

    // Add current node to MST
    inMST.add(current);
    if (parent[current] !== null) {
      mstEdges.push({ source: parent[current]!, target: current });
    }

    // Step: inMST.add(u), add MST edge
    steps.push({
      graph,
      activeLine: 13,
      highlights: {
        visiting: [current],
        visited: Array.from(inMST).filter(n => n !== current),
        path: Array.from(inMST),
        mstEdges: mstEdges.map(e => ({ ...e })),
      },
      metadata: { queue: pq.map(p => p.node), currentNode: current, startNode, keys: { ...key } },
    });

    const neighbors = adjacencyList.get(current) || [];

    for (const { node: neighbor, weight } of neighbors) {
      if (inMST.has(neighbor)) continue;

      // Step: checking neighbor
      steps.push({
        graph,
        activeLine: 17,
        highlights: {
          current: [current],
          visiting: [neighbor],
          visited: Array.from(inMST),
          path: Array.from(inMST),
          mstEdges: mstEdges.map(e => ({ ...e })),
        },
        metadata: { queue: pq.map(p => p.node), currentNode: current, startNode, keys: { ...key } },
      });

      if (weight < key[neighbor]) {
        key[neighbor] = weight;
        parent[neighbor] = current;
        pq.push({ node: neighbor, weight });

        // Step: update key and push to PQ
        steps.push({
          graph,
          activeLine: 20,
          highlights: {
            visiting: [neighbor],
            visited: Array.from(inMST),
            path: Array.from(inMST),
            mstEdges: mstEdges.map(e => ({ ...e })),
          },
          metadata: { queue: pq.map(p => p.node), currentNode: current, startNode, keys: { ...key } },
        });
      }
    }
  }

  // Final step: MST complete
  steps.push({
    graph,
    activeLine: 22,
    highlights: {
      visiting: [],
      visited: Array.from(inMST),
      path: Array.from(inMST),
      mstEdges: mstEdges.map(e => ({ ...e })),
    },
    metadata: { queue: [], currentNode: undefined, startNode, keys: { ...key } },
  });

  return steps;
}

const primAlgorithm: GraphAlgorithm = {
  id: 'prim',
  name: "Prim's MST",
  generateSteps: generatePrimSteps,
  code: primCode,
};

export default primAlgorithm;
