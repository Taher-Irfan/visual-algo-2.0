import type { Graph, GraphStep, GraphAlgorithm } from '../types';
import { createWeightedAdjacencyList } from '../utils/graph';

const primCode = `#include <iostream>
#include <vector>
#include <queue>
#include <limits>
using namespace std;

typedef pair<int, int> pii; // {weight, node}

void Prim(vector<vector<pii>>& graph, int start) {
    int n = graph.size();
    vector<bool> inMST(n, false);
    vector<int> key(n, INT_MAX);
    vector<int> parent(n, -1);
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    
    // Start from initial node
    key[start] = 0;
    pq.push({0, start});
    cout << "Starting Prim's from node " << start << endl;
    
    while (!pq.empty()) {
        // Get edge with minimum weight
        auto [weight, u] = pq.top();
        pq.pop();
        
        // Skip if already in MST
        if (inMST[u]) continue;
        
        inMST[u] = true;
        cout << "Add node " << u << " to MST" << endl;
        
        // Explore all neighbors
        for (auto [neighbor, edgeWeight] : graph[u]) {
            if (!inMST[neighbor] && edgeWeight < key[neighbor]) {
                key[neighbor] = edgeWeight;
                parent[neighbor] = u;
                pq.push({edgeWeight, neighbor});
                cout << "Update edge to node " << neighbor << endl;
            }
        }
    }
}`;

export function generatePrimSteps(graph: Graph, startNode: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const adjacencyList = createWeightedAdjacencyList(graph);
  const inMST = new Set<string>();
  const key: Record<string, number> = {};
  const parent: Record<string, string | null> = {};
  
  graph.nodes.forEach(node => {
    key[node.id] = Infinity;
    parent[node.id] = null;
  });
  
  key[startNode] = 0;
  
  const pq: Array<{node: string, weight: number}> = [{node: startNode, weight: 0}];
  
  steps.push({
    graph,
    activeLine: 11,
    highlights: { visiting: [], visited: [], path: [] },
    metadata: { 
      queue: [startNode], 
      currentNode: undefined, 
      startNode 
    },
  });
  
  steps.push({
    graph,
    activeLine: 15,
    highlights: { visiting: [startNode], visited: [], path: [] },
    metadata: { 
      queue: [startNode], 
      currentNode: startNode, 
      startNode 
    },
  });
  
  while (pq.length > 0) {
    pq.sort((a, b) => a.weight - b.weight);
    const {node: current} = pq.shift()!;
    
    if (inMST.has(current)) continue;
    
    inMST.add(current);
    
    steps.push({
      graph,
      activeLine: 25,
      highlights: { 
        visiting: [current], 
        visited: Array.from(inMST).filter(n => n !== current), 
        path: Array.from(inMST)
      },
      metadata: { 
        queue: pq.map(p => p.node), 
        currentNode: current, 
        startNode 
      },
    });
    
    const neighbors = adjacencyList.get(current) || [];
    
    for (const {node: neighbor, weight} of neighbors) {
      if (!inMST.has(neighbor)) {
        steps.push({
          graph,
          activeLine: 30,
          highlights: { 
            visiting: [current, neighbor], 
            visited: Array.from(inMST), 
            path: Array.from(inMST)
          },
          metadata: { 
            queue: pq.map(p => p.node), 
            currentNode: current, 
            startNode 
          },
        });
        
        if (weight < key[neighbor]) {
          key[neighbor] = weight;
          parent[neighbor] = current;
          pq.push({node: neighbor, weight});
          
          steps.push({
            graph,
            activeLine: 33,
            highlights: { 
              visiting: [neighbor], 
              visited: Array.from(inMST), 
              path: Array.from(inMST)
            },
            metadata: { 
              queue: pq.map(p => p.node), 
              currentNode: current, 
              startNode 
            },
          });
        }
      }
    }
  }
  
  steps.push({
    graph,
    activeLine: 37,
    highlights: { 
      visiting: [], 
      visited: Array.from(inMST), 
      path: Array.from(inMST)
    },
    metadata: { 
      queue: [], 
      currentNode: undefined, 
      startNode 
    },
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
