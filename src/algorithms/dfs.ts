import type { Graph, GraphStep, GraphAlgorithm } from '../types';
import { createAdjacencyList } from '../utils/graph';

const dfsCode = `#include <iostream>
#include <vector>
#include <stack>
using namespace std;

void DFS(vector<vector<int>>& graph, int start) {
    int n = graph.size();
    vector<bool> visited(n, false);
    stack<int> s;
    
    // Start from the initial node
    s.push(start);
    cout << "Starting DFS from node " << start << endl;
    
    while (!s.empty()) {
        // Pop a node from stack
        int current = s.top();
        s.pop();
        
        if (!visited[current]) {
            visited[current] = true;
            cout << "Visit node " << current << endl;
            
            // Push all neighbors to stack
            for (int neighbor : graph[current]) {
                if (!visited[neighbor]) {
                    s.push(neighbor);
                    cout << "Push node " << neighbor << endl;
                }
            }
        }
    }
}`;

export function generateDFSSteps(graph: Graph, startNode: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const adjacencyList = createAdjacencyList(graph);
  const visited = new Set<string>();
  const stack: string[] = [];

  steps.push({
    graph,
    activeLine: 9,
    highlights: { visiting: [], visited: [], path: [] },
    metadata: { stack: [], currentNode: undefined, startNode },
  });

  stack.push(startNode);

  steps.push({
    graph,
    activeLine: 14,
    highlights: { visiting: [startNode], visited: [], path: [] },
    metadata: { stack: [startNode], currentNode: startNode, startNode },
  });

  while (stack.length > 0) {
    steps.push({
      graph,
      activeLine: 17,
      highlights: { 
        visiting: [stack[stack.length - 1]], 
        visited: Array.from(visited), 
        path: [] 
      },
      metadata: { stack: [...stack], currentNode: stack[stack.length - 1], startNode },
    });

    const current = stack.pop()!;

    steps.push({
      graph,
      activeLine: 20,
      highlights: { 
        visiting: [current], 
        visited: Array.from(visited), 
        path: [] 
      },
      metadata: { stack: [...stack], currentNode: current, startNode },
    });

    if (!visited.has(current)) {
      visited.add(current);

      steps.push({
        graph,
        activeLine: 23,
        highlights: { 
          visiting: [current], 
          visited: Array.from(visited), 
          path: [] 
        },
        metadata: { stack: [...stack], currentNode: current, startNode },
      });

      const neighbors = adjacencyList.get(current) || [];

      for (const neighbor of neighbors) {
        steps.push({
          graph,
          activeLine: 26,
          highlights: { 
            visiting: [current, neighbor], 
            visited: Array.from(visited), 
            path: [] 
          },
          metadata: { stack: [...stack], currentNode: current, startNode },
        });

        if (!visited.has(neighbor)) {
          stack.push(neighbor);

          steps.push({
            graph,
            activeLine: 28,
            highlights: { 
              visiting: [neighbor], 
              visited: Array.from(visited), 
              path: [] 
            },
            metadata: { stack: [...stack], currentNode: current, startNode },
          });
        }
      }
    }

    steps.push({
      graph,
      activeLine: 32,
      highlights: { 
        visiting: [], 
        visited: Array.from(visited), 
        path: [] 
      },
      metadata: { stack: [...stack], currentNode: undefined, startNode },
    });
  }

  steps.push({
    graph,
    activeLine: 33,
    highlights: { 
      visiting: [], 
      visited: Array.from(visited), 
      path: Array.from(visited) 
    },
    metadata: { stack: [], currentNode: undefined, startNode },
  });

  return steps;
}

const dfsAlgorithm: GraphAlgorithm = {
  id: 'dfs',
  name: 'Depth-First Search',
  generateSteps: generateDFSSteps,
  code: dfsCode,
};

export default dfsAlgorithm;
