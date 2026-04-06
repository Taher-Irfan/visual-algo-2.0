import type { Graph, GraphStep, GraphAlgorithm } from '../types';
import { createAdjacencyList } from '../utils/graph';

const bfsCode = `void BFS(vector<vector<int>>& graph, int start) {
    int n = graph.size();
    vector<bool> visited(n, false);
    queue<int> q;
    
    // Start from the initial node
    visited[start] = true;
    q.push(start);
    cout << "Starting BFS from node " << start << endl;
    
    while (!q.empty()) {
        // Dequeue a node
        int current = q.front();
        q.pop();
        cout << "Visit node " << current << endl;
        
        // Explore all neighbors
        for (int neighbor : graph[current]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
                cout << "Enqueue node " << neighbor << endl;
            }
        }
    }
}`;

export function generateBFSSteps(graph: Graph, startNode: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const adjacencyList = createAdjacencyList(graph);
  const visited = new Set<string>();
  const queue: string[] = [];
  const levels: Record<string, number> = {};

  steps.push({
    graph,
    activeLine: 2,
    highlights: { visiting: [], visited: [], path: [] },
    metadata: { queue: [], currentNode: undefined, startNode, levels: {} },
  });

  visited.add(startNode);
  queue.push(startNode);
  levels[startNode] = 0;

  steps.push({
    graph,
    activeLine: 8,
    highlights: { visiting: [startNode], visited: [], path: [] },
    metadata: { queue: [startNode], currentNode: startNode, startNode, levels: { ...levels } },
  });

  while (queue.length > 0) {
    steps.push({
      graph,
      activeLine: 12,
      highlights: {
        visiting: [queue[0]],
        visited: Array.from(visited).filter(n => n !== queue[0]),
        path: []
      },
      metadata: { queue: [...queue], currentNode: queue[0], startNode, levels: { ...levels } },
    });

    const current = queue.shift()!;

    steps.push({
      graph,
      activeLine: 15,
      highlights: {
        visiting: [current],
        visited: Array.from(visited).filter(n => n !== current),
        path: []
      },
      metadata: { queue: [...queue], currentNode: current, startNode, levels: { ...levels } },
    });

    const neighbors = adjacencyList.get(current) || [];

    for (const neighbor of neighbors) {
      steps.push({
        graph,
        activeLine: 18,
        highlights: {
          visiting: [current, neighbor],
          visited: Array.from(visited),
          path: []
        },
        metadata: { queue: [...queue], currentNode: current, startNode, levels: { ...levels } },
      });

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        levels[neighbor] = levels[current] + 1;

        steps.push({
          graph,
          activeLine: 20,
          highlights: {
            visiting: [neighbor],
            visited: Array.from(visited).filter(n => n !== neighbor),
            path: []
          },
          metadata: { queue: [...queue], currentNode: current, startNode, levels: { ...levels } },
        });
      }
    }

    steps.push({
      graph,
      activeLine: 24,
      highlights: {
        visiting: [],
        visited: Array.from(visited),
        path: []
      },
      metadata: { queue: [...queue], currentNode: undefined, startNode, levels: { ...levels } },
    });
  }

  steps.push({
    graph,
    activeLine: 25,
    highlights: {
      visiting: [],
      visited: Array.from(visited),
      path: Array.from(visited)
    },
    metadata: { queue: [], currentNode: undefined, startNode, levels: { ...levels } },
  });

  return steps;
}

const bfsAlgorithm: GraphAlgorithm = {
  id: 'bfs',
  name: 'Breadth-First Search',
  generateSteps: generateBFSSteps,
  code: bfsCode,
};

export default bfsAlgorithm;
