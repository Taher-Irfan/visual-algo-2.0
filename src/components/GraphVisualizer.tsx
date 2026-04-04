import type { Graph } from '../types';

interface GraphVisualizerProps {
  graph: Graph;
  highlights: {
    visiting?: string[];
    visited?: string[];
    path?: string[];
  };
}

export default function GraphVisualizer({ graph, highlights }: GraphVisualizerProps) {
  const { visiting = [], visited = [], path = [] } = highlights;

  const getNodeColor = (nodeId: string): string => {
    if (path.includes(nodeId)) return 'fill-green-500 dark:fill-green-400';
    if (visiting.includes(nodeId)) return 'fill-yellow-500 dark:fill-yellow-400';
    if (visited.includes(nodeId)) return 'fill-blue-500 dark:fill-blue-400';
    return 'fill-gray-400 dark:fill-gray-600';
  };

  const getNodeStroke = (nodeId: string): string => {
    if (path.includes(nodeId)) return 'stroke-green-700 dark:stroke-green-300';
    if (visiting.includes(nodeId)) return 'stroke-yellow-700 dark:stroke-yellow-300';
    if (visited.includes(nodeId)) return 'stroke-blue-700 dark:stroke-blue-300';
    return 'stroke-gray-600 dark:stroke-gray-500';
  };

  const getEdgeColor = (sourceId: string, targetId: string): string => {
    const isPathEdge = 
      (path.includes(sourceId) && path.includes(targetId)) ||
      (visited.includes(sourceId) && visited.includes(targetId));
    
    return isPathEdge 
      ? 'stroke-blue-400 dark:stroke-blue-500' 
      : 'stroke-gray-300 dark:stroke-gray-700';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-soft p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Graph Visualization
        </h2>
      </div>

      <div className="relative w-full h-[500px] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Render edges first (so they appear behind nodes) */}
          {graph.edges.map((edge, index) => {
            const sourceNode = graph.nodes.find(n => n.id === edge.source);
            const targetNode = graph.nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;

            const midX = (sourceNode.position.x + targetNode.position.x) / 2;
            const midY = (sourceNode.position.y + targetNode.position.y) / 2;

            return (
              <g key={`edge-${index}`}>
                <line
                  x1={sourceNode.position.x}
                  y1={sourceNode.position.y}
                  x2={targetNode.position.x}
                  y2={targetNode.position.y}
                  className={`${getEdgeColor(edge.source, edge.target)} transition-colors duration-300`}
                  strokeWidth="2"
                />
                {edge.weight !== undefined && (
                  <g>
                    <circle
                      cx={midX}
                      cy={midY}
                      r="10"
                      className="fill-white dark:fill-gray-700 stroke-gray-300 dark:stroke-gray-600"
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-xs font-bold fill-gray-700 dark:fill-gray-300 pointer-events-none select-none"
                    >
                      {edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render nodes */}
          {graph.nodes.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r="20"
                className={`${getNodeColor(node.id)} ${getNodeStroke(node.id)} transition-all duration-300`}
                strokeWidth="3"
              />
              <text
                x={node.position.x}
                y={node.position.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-sm font-bold fill-white dark:fill-gray-900 pointer-events-none select-none"
              >
                {node.id}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-gray-400 dark:bg-gray-600"></div>
          <span className="text-gray-700 dark:text-gray-300">Default</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500 dark:bg-yellow-400"></div>
          <span className="text-gray-700 dark:text-gray-300">Visiting</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400"></div>
          <span className="text-gray-700 dark:text-gray-300">Visited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500 dark:bg-green-400"></div>
          <span className="text-gray-700 dark:text-gray-300">Path</span>
        </div>
      </div>
    </div>
  );
}
