import type { Graph, GraphStep, GraphAlgorithm } from '../types';
import { createWeightedAdjacencyList } from '../utils/graph';

const aStarCode = `void aStar(graph, start, target) {
  g[v] = INF for each v;  g[start] = 0
  f[start] = h(start)
  open.push(f[start], start)

  while open is not empty:
    u = open.pop_min_f()
    if u == target: return path via prev[]
    if u in closed: continue
    closed.add(u)

    for (v, w) in neighbors(u):
      if g[u] + w < g[v]:
        g[v] = g[u] + w
        f[v] = g[v] + h(v)
        prev[v] = u
        open.push(f[v], v)
}
// h(v) = scaled straight-line distance to target
// (admissible: scale = min edge weight per pixel)`;

// Line numbers (1-indexed) for activeLine highlights:
// 1  void aStar(graph, start, target) {
// 2    g[v] = INF for each v;  g[start] = 0
// 3    f[start] = h(start)
// 4    open.push(f[start], start)
// 5  (blank)
// 6    while open is not empty:
// 7      u = open.pop_min_f()
// 8      if u == target: return path via prev[]
// 9      if u in closed: continue
// 10     closed.add(u)
// 11 (blank)
// 12     for (v, w) in neighbors(u):
// 13       if g[u] + w < g[v]:
// 14         g[v] = g[u] + w
// 15         f[v] = g[v] + h(v)
// 16         prev[v] = u
// 17         open.push(f[v], v)
// 18 }

/**
 * Generate visualization steps for A* pathfinding.
 *
 * The target is chosen automatically as the node geometrically farthest from
 * the start, so the heuristic has room to guide the search. The heuristic is
 * h(v) = r · euclid(v, target) with r = min over edges of (weight / pixel
 * length). Since every edge costs at least r times its drawn length, the
 * straight-line estimate never overestimates the true remaining cost and is
 * consistent — A* therefore returns a true shortest path.
 *
 * Time Complexity: O(E log V) with a binary heap
 * Space Complexity: O(V)
 */
export function generateAStarSteps(graph: Graph, startNode: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const adjacency = createWeightedAdjacencyList(graph);

  const positions = new Map(graph.nodes.map(n => [n.id, n.position]));
  const euclid = (a: string, b: string): number => {
    const pa = positions.get(a)!;
    const pb = positions.get(b)!;
    return Math.hypot(pa.x - pb.x, pa.y - pb.y);
  };

  // Target: the node farthest from the start (fallback: start itself)
  let targetNode = startNode;
  let maxDist = -1;
  graph.nodes.forEach(n => {
    const d = euclid(startNode, n.id);
    if (d > maxDist) {
      maxDist = d;
      targetNode = n.id;
    }
  });

  // Admissible scale: r = min(weight / pixel length) over all edges
  let ratio = Infinity;
  graph.edges.forEach(e => {
    const len = euclid(e.source, e.target);
    if (len > 0) ratio = Math.min(ratio, (e.weight ?? 1) / len);
  });
  if (!isFinite(ratio)) ratio = 0;

  const h = (v: string): number => Math.round(ratio * euclid(v, targetNode) * 10) / 10;

  const g: Record<string, number> = {};
  const f: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  graph.nodes.forEach(n => {
    g[n.id] = Infinity;
    f[n.id] = Infinity;
    previous[n.id] = null;
  });
  g[startNode] = 0;
  f[startNode] = h(startNode);

  const closed = new Set<string>();
  const open: Array<{ node: string; f: number }> = [{ node: startNode, f: f[startNode] }];

  const snapshot = () => ({
    distances: { ...g },
    fScores: { ...f },
    previous: { ...previous },
  });

  const reconstructPath = (): string[] => {
    const path: string[] = [];
    let cur: string | null = targetNode;
    while (cur !== null) {
      path.unshift(cur);
      cur = previous[cur];
    }
    return path;
  };

  // Step 0: initialise scores and seed the open set (lines 2-4)
  steps.push({
    graph,
    activeLine: 4,
    highlights: { visiting: [startNode], visited: [], path: [targetNode] },
    metadata: { queue: [startNode], currentNode: startNode, startNode, targetNode, ...snapshot() },
  });

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const { node: current } = open.shift()!;

    // Step: pop the open node with the smallest f (line 7)
    steps.push({
      graph,
      activeLine: 7,
      highlights: {
        visiting: [current],
        visited: Array.from(closed),
        path: [targetNode],
      },
      metadata: { queue: open.map(o => o.node), currentNode: current, startNode, targetNode, ...snapshot() },
    });

    if (current === targetNode) {
      // Step: target reached — show the shortest path (line 8)
      const path = reconstructPath();
      steps.push({
        graph,
        activeLine: 8,
        highlights: { visiting: [], visited: Array.from(closed), path },
        metadata: { queue: [], currentNode: targetNode, startNode, targetNode, ...snapshot() },
      });
      steps.push({
        graph,
        activeLine: 18,
        highlights: { visiting: [], visited: Array.from(closed), path },
        metadata: { queue: [], currentNode: undefined, startNode, targetNode, ...snapshot() },
      });
      return steps;
    }

    if (closed.has(current)) continue;
    closed.add(current);

    // Step: settle the node (line 10)
    steps.push({
      graph,
      activeLine: 10,
      highlights: {
        visiting: [current],
        visited: Array.from(closed).filter(c => c !== current),
        path: [targetNode],
      },
      metadata: { queue: open.map(o => o.node), currentNode: current, startNode, targetNode, ...snapshot() },
    });

    const neighbors = adjacency.get(current) || [];
    for (const { node: neighbor, weight } of neighbors) {
      if (closed.has(neighbor)) continue;

      // Step: examine the neighbor (line 13)
      steps.push({
        graph,
        activeLine: 13,
        highlights: {
          current: [current],
          visiting: [neighbor],
          visited: Array.from(closed),
          path: [targetNode],
        },
        metadata: { queue: open.map(o => o.node), currentNode: current, startNode, targetNode, ...snapshot() },
      });

      if (g[current] + weight < g[neighbor]) {
        g[neighbor] = g[current] + weight;
        f[neighbor] = Math.round((g[neighbor] + h(neighbor)) * 10) / 10;
        previous[neighbor] = current;
        open.push({ node: neighbor, f: f[neighbor] });

        // Step: improved path — update scores and push (lines 14-17)
        steps.push({
          graph,
          activeLine: 15,
          highlights: {
            current: [current],
            visiting: [neighbor],
            visited: Array.from(closed),
            path: [targetNode],
          },
          metadata: { queue: open.map(o => o.node), currentNode: neighbor, startNode, targetNode, ...snapshot() },
        });
      }
    }
  }

  // Open set exhausted without reaching the target (disconnected graph)
  steps.push({
    graph,
    activeLine: 18,
    highlights: { visiting: [], visited: Array.from(closed), path: [] },
    metadata: { queue: [], currentNode: undefined, startNode, targetNode, ...snapshot() },
  });

  return steps;
}

const aStarAlgorithm: GraphAlgorithm = {
  id: 'astar',
  name: 'A* Pathfinding',
  generateSteps: generateAStarSteps,
  code: aStarCode,
};

export default aStarAlgorithm;
