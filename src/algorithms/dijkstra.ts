import type { Graph, GraphStep, GraphAlgorithm } from '../types';
import { createWeightedAdjacencyList } from '../utils/graph';

const dijkstraCode = `typedef pair<int, int> pii; // {distance, node}

void Dijkstra(vector<vector<pii>>& graph, int start) {
    int n = graph.size();
    vector<int> dist(n, INT_MAX);
    vector<int> prev(n, -1);
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    
    // Initialize start node
    dist[start] = 0;
    pq.push({0, start});
    cout << "Starting Dijkstra from node " << start << endl;
    
    while (!pq.empty()) {
        // Get node with minimum distance
        auto [d, u] = pq.top();
        pq.pop();
        
        // Skip if we've found a better path
        if (d > dist[u]) continue;
        
        cout << "Visit node " << u << " with distance " << d << endl;
        
        // Explore all neighbors
        for (auto [neighbor, weight] : graph[u]) {
            int newDist = dist[u] + weight;
            
            // Found shorter path
            if (newDist < dist[neighbor]) {
                dist[neighbor] = newDist;
                prev[neighbor] = u;
                pq.push({newDist, neighbor});
                cout << "Update node " << neighbor << " distance to " << newDist << endl;
            }
        }
    }
}`;

export function generateDijkstraSteps(graph: Graph, startNode: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const adjacencyList = createWeightedAdjacencyList(graph);
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  
  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });
  
  distances[startNode] = 0;
  
  const pq: Array<{node: string, dist: number}> = [{node: startNode, dist: 0}];
  
  steps.push({
    graph,
    activeLine: 5,
    highlights: { visiting: [], visited: [], path: [] },
    metadata: { 
      queue: [startNode], 
      currentNode: undefined, 
      startNode,
      distances: {...distances},
      previous: {...previous}
    },
  });
  
  steps.push({
    graph,
    activeLine: 9,
    highlights: { visiting: [startNode], visited: [], path: [] },
    metadata: { 
      queue: [startNode], 
      currentNode: startNode, 
      startNode,
      distances: {...distances},
      previous: {...previous}
    },
  });
  
  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const {node: current, dist: currentDist} = pq.shift()!;
    
    if (visited.has(current)) continue;
    if (currentDist > distances[current]) continue;
    
    visited.add(current);
    
    steps.push({
      graph,
      activeLine: 14,
      highlights: { 
        visiting: [current], 
        visited: Array.from(visited).filter(n => n !== current), 
        path: [] 
      },
      metadata: { 
        queue: pq.map(p => p.node), 
        currentNode: current, 
        startNode,
        distances: {...distances},
        previous: {...previous}
      },
    });
    
    const neighbors = adjacencyList.get(current) || [];
    
    for (const {node: neighbor, weight} of neighbors) {
      steps.push({
        graph,
        activeLine: 23,
        highlights: { 
          visiting: [current, neighbor], 
          visited: Array.from(visited), 
          path: [] 
        },
        metadata: { 
          queue: pq.map(p => p.node), 
          currentNode: current, 
          startNode,
          distances: {...distances},
          previous: {...previous}
        },
      });
      
      const newDist = distances[current] + weight;
      
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        previous[neighbor] = current;
        pq.push({node: neighbor, dist: newDist});
        
        steps.push({
          graph,
          activeLine: 27,
          highlights: { 
            visiting: [neighbor], 
            visited: Array.from(visited), 
            path: [] 
          },
          metadata: { 
            queue: pq.map(p => p.node), 
            currentNode: current, 
            startNode,
            distances: {...distances},
            previous: {...previous}
          },
        });
      }
    }
  }
  
  const path: string[] = [];
  graph.nodes.forEach(node => {
    if (distances[node.id] !== Infinity) {
      path.push(node.id);
    }
  });
  
  steps.push({
    graph,
    activeLine: 32,
    highlights: { 
      visiting: [], 
      visited: Array.from(visited), 
      path 
    },
    metadata: { 
      queue: [], 
      currentNode: undefined, 
      startNode,
      distances: {...distances},
      previous: {...previous}
    },
  });
  
  return steps;
}

const dijkstraAlgorithm: GraphAlgorithm = {
  id: 'dijkstra',
  name: "Dijkstra's Algorithm",
  generateSteps: generateDijkstraSteps,
  code: dijkstraCode,
};

export default dijkstraAlgorithm;
