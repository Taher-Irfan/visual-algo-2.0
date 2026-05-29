import type { Graph, GraphStep, GraphAlgorithm } from '../types';

const kruskalCode = `int kruskal(graph):
  sort edges by weight ascending
  parent = {v: v for each v}
  mstWeight = 0
  mst = []

  for (u, v, w) in sorted edges:
    ru = find(u)
    rv = find(v)
    if ru != rv:
      union(ru, rv)
      mst.add((u, v))
      mstWeight += w
    else:
      skip   // adding (u,v) would form a cycle

  return mst, mstWeight`;

// Line numbers (1-indexed) for activeLine highlights:
// 1  int kruskal(graph):
// 2    sort edges by weight ascending
// 3    parent = {v: v for each v}
// 4    mstWeight = 0
// 5    mst = []
// 6  (blank)
// 7    for (u, v, w) in sorted edges:
// 8      ru = find(u)
// 9      rv = find(v)
// 10     if ru != rv:
// 11       union(ru, rv)
// 12       mst.add((u, v))
// 13       mstWeight += w
// 14     else:
// 15       skip   // adding (u,v) would form a cycle
// 16 (blank)
// 17   return mst, mstWeight

/**
 * Generate visualization steps for Kruskal's Minimum Spanning Tree algorithm.
 *
 * Note: Kruskal processes a global, weight-sorted edge list rather than
 * exploring from a single source, so `startNode` is accepted only to match
 * the GraphAlgorithm signature and is not used by the algorithm itself.
 *
 * Time Complexity: O(E log E)
 * Space Complexity: O(V) for the disjoint-set structure
 */
export function generateKruskalSteps(graph: Graph, _startNode: string): GraphStep[] {
  void _startNode;
  const steps: GraphStep[] = [];

  // Disjoint-set (union-find) over node ids
  const parent: Record<string, string> = {};
  const rank: Record<string, number> = {};
  graph.nodes.forEach(node => {
    parent[node.id] = node.id;
    rank[node.id] = 0;
  });

  const find = (x: string): string => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; // path compression by halving
      x = parent[x];
    }
    return x;
  };

  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return;
    if (rank[ra] < rank[rb]) {
      parent[ra] = rb;
    } else if (rank[ra] > rank[rb]) {
      parent[rb] = ra;
    } else {
      parent[rb] = ra;
      rank[ra]++;
    }
  };

  // Sorted edge list (stable, ascending by weight)
  const sortedEdges = graph.edges
    .map(e => ({ source: e.source, target: e.target, weight: e.weight ?? 1 }))
    .sort((a, b) => a.weight - b.weight);

  const mstEdges: Array<{ source: string; target: string }> = [];
  const inMST = new Set<string>();
  let mstWeight = 0;

  type ListEntry = { source: string; target: string; weight: number; status: 'pending' | 'accepted' | 'rejected' };
  const edgeList: ListEntry[] = sortedEdges.map(e => ({ ...e, status: 'pending' as const }));

  // Step 0: edges sorted, sets initialized (line 2)
  steps.push({
    graph,
    activeLine: 2,
    highlights: { visiting: [], visited: [], path: [], mstEdges: [] },
    metadata: {
      mstWeight: 0,
      edgeList: edgeList.map(e => ({ ...e })),
    },
  });

  for (let idx = 0; idx < sortedEdges.length; idx++) {
    const edge = sortedEdges[idx];
    const { source: u, target: v, weight: w } = edge;

    // Line 7: pick next-cheapest edge — highlight its endpoints
    steps.push({
      graph,
      activeLine: 7,
      highlights: {
        current: [u, v],
        visited: Array.from(inMST),
        path: Array.from(inMST),
        mstEdges: mstEdges.map(e => ({ ...e })),
      },
      metadata: {
        currentEdge: { source: u, target: v, weight: w },
        mstWeight,
        edgeList: edgeList.map(e => ({ ...e })),
      },
    });

    const ru = find(u);
    const rv = find(v);

    // Line 10: do the endpoints already share a set?
    steps.push({
      graph,
      activeLine: 10,
      highlights: {
        current: [u, v],
        visited: Array.from(inMST),
        path: Array.from(inMST),
        mstEdges: mstEdges.map(e => ({ ...e })),
      },
      metadata: {
        currentEdge: { source: u, target: v, weight: w },
        mstWeight,
        edgeList: edgeList.map(e => ({ ...e })),
      },
    });

    if (ru !== rv) {
      // Line 11-13: accept the edge into the MST
      union(u, v);
      mstEdges.push({ source: u, target: v });
      mstWeight += w;
      inMST.add(u);
      inMST.add(v);
      edgeList[idx].status = 'accepted';

      steps.push({
        graph,
        activeLine: 12,
        highlights: {
          visiting: [u, v],
          visited: Array.from(inMST),
          path: Array.from(inMST),
          mstEdges: mstEdges.map(e => ({ ...e })),
        },
        metadata: {
          currentEdge: { source: u, target: v, weight: w },
          mstWeight,
          edgeList: edgeList.map(e => ({ ...e })),
        },
      });
    } else {
      // Line 15: reject — would create a cycle
      edgeList[idx].status = 'rejected';

      steps.push({
        graph,
        activeLine: 15,
        highlights: {
          visited: Array.from(inMST),
          path: Array.from(inMST),
          mstEdges: mstEdges.map(e => ({ ...e })),
        },
        metadata: {
          currentEdge: { source: u, target: v, weight: w },
          mstWeight,
          edgeList: edgeList.map(e => ({ ...e })),
        },
      });
    }

    // A spanning tree of V nodes needs exactly V-1 edges; stop early once full.
    if (mstEdges.length === graph.nodes.length - 1) break;
  }

  // Final step: MST complete (line 17)
  steps.push({
    graph,
    activeLine: 17,
    highlights: {
      visited: Array.from(inMST),
      path: Array.from(inMST),
      mstEdges: mstEdges.map(e => ({ ...e })),
    },
    metadata: {
      mstWeight,
      edgeList: edgeList.map(e => ({ ...e })),
    },
  });

  return steps;
}

const kruskalAlgorithm: GraphAlgorithm = {
  id: 'kruskal',
  name: "Kruskal's MST",
  generateSteps: generateKruskalSteps,
  code: kruskalCode,
};

export default kruskalAlgorithm;
