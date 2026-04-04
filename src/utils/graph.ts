import type { Graph, GraphEdge } from '../types';

export type GraphLayoutType = 'tree' | 'circular' | 'grid' | 'mesh';

export function generateGraph(nodeCount: number, layout: GraphLayoutType): Graph {
  const nodes = generateNodes(nodeCount, layout);
  const edges = generateEdges(nodeCount, layout);
  
  return { nodes, edges };
}

function generateNodes(nodeCount: number, layout: GraphLayoutType) {
  const nodes = [];
  
  switch (layout) {
    case 'tree': {
      const levels = Math.ceil(Math.log2(nodeCount + 1));
      const width = 400;
      const height = 500;
      let nodeIndex = 0;
      
      for (let level = 0; level < levels && nodeIndex < nodeCount; level++) {
        const nodesInLevel = Math.min(Math.pow(2, level), nodeCount - nodeIndex);
        const spacing = width / (nodesInLevel + 1);
        const y = (height / (levels + 1)) * (level + 1);
        
        for (let i = 0; i < nodesInLevel && nodeIndex < nodeCount; i++, nodeIndex++) {
          nodes.push({
            id: String(nodeIndex),
            position: { x: spacing * (i + 1), y }
          });
        }
      }
      break;
    }
    
    case 'circular': {
      const centerX = 200;
      const centerY = 250;
      const radius = 150;
      
      for (let i = 0; i < nodeCount; i++) {
        const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
        nodes.push({
          id: String(i),
          position: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          }
        });
      }
      break;
    }
    
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(nodeCount));
      const rows = Math.ceil(nodeCount / cols);
      const spacing = 350 / (cols + 1);
      const verticalSpacing = 450 / (rows + 1);
      
      for (let i = 0; i < nodeCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        nodes.push({
          id: String(i),
          position: {
            x: 50 + spacing * (col + 1),
            y: 50 + verticalSpacing * (row + 1)
          }
        });
      }
      break;
    }
    
    case 'mesh': {
      const cols = Math.ceil(Math.sqrt(nodeCount));
      const rows = Math.ceil(nodeCount / cols);
      const spacing = 300 / (cols + 1);
      const verticalSpacing = 400 / (rows + 1);
      
      for (let i = 0; i < nodeCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        nodes.push({
          id: String(i),
          position: {
            x: 100 + spacing * col,
            y: 100 + verticalSpacing * row
          }
        });
      }
      break;
    }
  }
  
  return nodes;
}

function generateEdges(nodeCount: number, layout: GraphLayoutType): GraphEdge[] {
  const edges: GraphEdge[] = [];
  
  switch (layout) {
    case 'tree': {
      for (let i = 0; i < nodeCount; i++) {
        const leftChild = 2 * i + 1;
        const rightChild = 2 * i + 2;
        
        if (leftChild < nodeCount) {
          edges.push({ source: String(i), target: String(leftChild), weight: Math.floor(Math.random() * 10) + 1 });
        }
        if (rightChild < nodeCount) {
          edges.push({ source: String(i), target: String(rightChild), weight: Math.floor(Math.random() * 10) + 1 });
        }
      }
      break;
    }
    
    case 'circular': {
      for (let i = 0; i < nodeCount; i++) {
        edges.push({ 
          source: String(i), 
          target: String((i + 1) % nodeCount),
          weight: Math.floor(Math.random() * 10) + 1
        });
        
        if (nodeCount > 3 && i < nodeCount - 2) {
          edges.push({ 
            source: String(i), 
            target: String((i + 2) % nodeCount),
            weight: Math.floor(Math.random() * 15) + 5
          });
        }
      }
      break;
    }
    
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(nodeCount));
      
      for (let i = 0; i < nodeCount; i++) {
        const col = i % cols;
        
        if (col < cols - 1 && i + 1 < nodeCount) {
          edges.push({ source: String(i), target: String(i + 1), weight: Math.floor(Math.random() * 10) + 1 });
        }
        
        if (i + cols < nodeCount) {
          edges.push({ source: String(i), target: String(i + cols), weight: Math.floor(Math.random() * 10) + 1 });
        }
      }
      break;
    }
    
    case 'mesh': {
      const cols = Math.ceil(Math.sqrt(nodeCount));
      
      for (let i = 0; i < nodeCount; i++) {
        const col = i % cols;
        
        if (col < cols - 1 && i + 1 < nodeCount) {
          edges.push({ source: String(i), target: String(i + 1), weight: Math.floor(Math.random() * 10) + 1 });
        }
        
        if (i + cols < nodeCount) {
          edges.push({ source: String(i), target: String(i + cols), weight: Math.floor(Math.random() * 10) + 1 });
        }
        
        if (col < cols - 1 && i + cols + 1 < nodeCount) {
          edges.push({ source: String(i), target: String(i + cols + 1), weight: Math.floor(Math.random() * 15) + 5 });
        }
      }
      
      const center = Math.floor(nodeCount / 2);
      for (let i = 0; i < nodeCount; i++) {
        if (i !== center && Math.random() > 0.7) {
          edges.push({ source: String(i), target: String(center), weight: Math.floor(Math.random() * 20) + 5 });
        }
      }
      break;
    }
  }
  
  return edges;
}

export const createAdjacencyList = (graph: Graph): Map<string, string[]> => {
  const adjacencyList = new Map<string, string[]>();
  
  graph.nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });
  
  graph.edges.forEach(edge => {
    adjacencyList.get(edge.source)?.push(edge.target);
    adjacencyList.get(edge.target)?.push(edge.source);
  });
  
  return adjacencyList;
};

export const createWeightedAdjacencyList = (graph: Graph): Map<string, Array<{node: string, weight: number}>> => {
  const adjacencyList = new Map<string, Array<{node: string, weight: number}>>();
  
  graph.nodes.forEach(node => {
    adjacencyList.set(node.id, []);
  });
  
  graph.edges.forEach(edge => {
    const weight = edge.weight ?? 1;
    adjacencyList.get(edge.source)?.push({ node: edge.target, weight });
    adjacencyList.get(edge.target)?.push({ node: edge.source, weight });
  });
  
  return adjacencyList;
};
