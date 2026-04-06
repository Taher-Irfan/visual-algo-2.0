import type { Graph } from '../types';

interface GraphVisualizerProps {
  graph: Graph;
  highlights: {
    visiting?: string[];
    visited?: string[];
    path?: string[];
    mstEdges?: Array<{ source: string; target: string }>;
  };
  nodeLabels?: Record<string, number>;
  showEdgeWeights?: boolean;
}

export default function GraphVisualizer({ graph, highlights, nodeLabels, showEdgeWeights = true }: GraphVisualizerProps) {
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
    // MST edges (Prim) — explicitly tracked
    if (highlights.mstEdges) {
      const isMSTEdge = highlights.mstEdges.some(
        e => (e.source === sourceId && e.target === targetId) ||
             (e.source === targetId && e.target === sourceId)
      );
      return isMSTEdge
        ? 'stroke-green-400 dark:stroke-green-500'
        : 'stroke-gray-300 dark:stroke-gray-700';
    }

    const isPathEdge =
      (path.includes(sourceId) && path.includes(targetId)) ||
      (visited.includes(sourceId) && visited.includes(targetId));

    return isPathEdge
      ? 'stroke-blue-400 dark:stroke-blue-500'
      : 'stroke-gray-300 dark:stroke-gray-700';
  };

  // Compute a tight viewBox from actual node positions so the graph
  // is always displayed at 1px = 1px (no squishing) and the container
  // can scroll when the graph is larger than the viewport.
  const NODE_RADIUS = 20;
  const VB_PADDING = 40;
  // Extra right padding when node labels are shown beside nodes
  const LABEL_RIGHT_EXTRA = nodeLabels ? 36 : 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  graph.nodes.forEach(n => {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x);
    maxY = Math.max(maxY, n.position.y);
  });
  // Fallback for empty graph
  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 400; maxY = 400; }
  const vbX = minX - NODE_RADIUS - VB_PADDING;
  const vbY = minY - NODE_RADIUS - VB_PADDING;
  const vbW = maxX - minX + (NODE_RADIUS + VB_PADDING) * 2 + LABEL_RIGHT_EXTRA;
  const vbH = maxY - minY + (NODE_RADIUS + VB_PADDING) * 2;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-soft p-4 sm:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Graph Visualization
        </h2>
      </div>

      {/* Scrollable in both axes; SVG rendered at natural pixel size */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto max-h-[280px] sm:max-h-[460px]">
        <svg
          style={{ width: `${vbW}px`, height: `${vbH}px`, minWidth: '100%', display: 'block' }}
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Render edges first (so they appear behind nodes) */}
          {graph.edges.map((edge, index) => {
            const sourceNode = graph.nodes.find(n => n.id === edge.source);
            const targetNode = graph.nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;

            const midX = (sourceNode.position.x + targetNode.position.x) / 2;
            const midY = (sourceNode.position.y + targetNode.position.y) / 2;

            // Perpendicular offset so weight labels don't overlap node labels
            const dx = targetNode.position.x - sourceNode.position.x;
            const dy = targetNode.position.y - sourceNode.position.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const PERP_OFFSET = 13;
            const labelX = midX + (-dy / len) * PERP_OFFSET;
            const labelY = midY + (dx / len) * PERP_OFFSET;

            const isMSTEdge = highlights.mstEdges?.some(
              e => (e.source === edge.source && e.target === edge.target) ||
                   (e.source === edge.target && e.target === edge.source)
            ) ?? false;

            return (
              <g key={`edge-${index}`}>
                <line
                  x1={sourceNode.position.x}
                  y1={sourceNode.position.y}
                  x2={targetNode.position.x}
                  y2={targetNode.position.y}
                  className={`${getEdgeColor(edge.source, edge.target)} transition-colors duration-300`}
                  strokeWidth={isMSTEdge ? "3.5" : "2"}
                />
                {showEdgeWeights && edge.weight !== undefined && (
                  <g>
                    <circle
                      cx={labelX}
                      cy={labelY}
                      r="10"
                      className="fill-white dark:fill-gray-700 stroke-gray-300 dark:stroke-gray-600"
                      strokeWidth="1"
                    />
                    <text
                      x={labelX}
                      y={labelY}
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
          {graph.nodes.map((node) => {
            const label = nodeLabels?.[node.id];
            const labelText = label === undefined ? null : label === Infinity ? '∞' : String(label);
            return (
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
                {labelText !== null && (
                  <g>
                    <rect
                      x={node.position.x + 22}
                      y={node.position.y - 9}
                      width="28"
                      height="18"
                      rx="4"
                      className="fill-gray-200 dark:fill-gray-700"
                    />
                    <text
                      x={node.position.x + 36}
                      y={node.position.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="10"
                      fontWeight="700"
                      className="fill-gray-800 dark:fill-gray-100 pointer-events-none select-none"
                    >
                      {labelText}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center flex-wrap gap-3 sm:space-x-6 text-sm">
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
