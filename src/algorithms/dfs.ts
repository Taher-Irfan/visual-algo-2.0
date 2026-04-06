import type { Graph, GraphStep, GraphAlgorithm } from '../types';
import { createAdjacencyList } from '../utils/graph';

const dfsCode = `void DFS(graph, node, visited[]) {
    visited[node] = true
    print "Visit " + node

    for neighbor in graph[node]:
        if not visited[neighbor]:
            DFS(graph, neighbor, visited)
}

void main():
    visited = [false, ..., false]
    DFS(graph, start, visited)`;

function dfsHelper(
  node: string,
  graph: Graph,
  adjacencyList: Map<string, string[]>,
  visited: Set<string>,
  callStack: string[],
  steps: GraphStep[],
  startNode: string
) {
  callStack.push(node);

  // Line 1: visited[node] = true
  steps.push({
    graph,
    activeLine: 1,
    highlights: { visiting: [node], visited: Array.from(visited), path: [] },
    metadata: { stack: [...callStack], currentNode: node, startNode },
  });

  visited.add(node);

  // Line 2: print "Visit " + node
  steps.push({
    graph,
    activeLine: 2,
    highlights: { visiting: [node], visited: Array.from(visited), path: [] },
    metadata: { stack: [...callStack], currentNode: node, startNode },
  });

  const neighbors = adjacencyList.get(node) || [];

  for (const neighbor of neighbors) {
    // Line 4: for neighbor in graph[node]
    steps.push({
      graph,
      activeLine: 4,
      highlights: { visiting: [node, neighbor], visited: Array.from(visited), path: [] },
      metadata: { stack: [...callStack], currentNode: node, startNode },
    });

    // Line 5: if not visited[neighbor]
    steps.push({
      graph,
      activeLine: 5,
      highlights: { visiting: [node, neighbor], visited: Array.from(visited), path: [] },
      metadata: { stack: [...callStack], currentNode: node, startNode },
    });

    if (!visited.has(neighbor)) {
      // Line 6: DFS(graph, neighbor, visited) — entering recursive call
      steps.push({
        graph,
        activeLine: 6,
        highlights: { visiting: [neighbor], visited: Array.from(visited), path: [] },
        metadata: { stack: [...callStack, neighbor], currentNode: neighbor, startNode },
      });

      dfsHelper(neighbor, graph, adjacencyList, visited, callStack, steps, startNode);
    }
  }

  // Line 7: closing brace — backtrack, return to caller
  callStack.pop();

  steps.push({
    graph,
    activeLine: 7,
    highlights: {
      visiting: callStack.length > 0 ? [callStack[callStack.length - 1]] : [],
      visited: Array.from(visited),
      path: [],
    },
    metadata: {
      stack: [...callStack],
      currentNode: callStack.length > 0 ? callStack[callStack.length - 1] : undefined,
      startNode,
    },
  });
}

export function generateDFSSteps(graph: Graph, startNode: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const adjacencyList = createAdjacencyList(graph);
  const visited = new Set<string>();
  const callStack: string[] = [];

  // Line 10: visited = [false, ..., false]
  steps.push({
    graph,
    activeLine: 10,
    highlights: { visiting: [], visited: [], path: [] },
    metadata: { stack: [], currentNode: undefined, startNode },
  });

  // Line 11: DFS(graph, start, visited)
  steps.push({
    graph,
    activeLine: 11,
    highlights: { visiting: [startNode], visited: [], path: [] },
    metadata: { stack: [startNode], currentNode: startNode, startNode },
  });

  dfsHelper(startNode, graph, adjacencyList, visited, callStack, steps, startNode);

  // Final: all nodes explored — highlight in green
  steps.push({
    graph,
    activeLine: 11,
    highlights: {
      visiting: [],
      visited: Array.from(visited),
      path: Array.from(visited),
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
