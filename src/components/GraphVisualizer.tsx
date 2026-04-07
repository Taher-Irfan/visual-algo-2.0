import { useState, useRef, useEffect } from 'react';
import type { Graph, GraphNode } from '../types';

interface GraphVisualizerProps {
  graph: Graph;
  highlights: {
    current?: string[];
    visiting?: string[];
    visited?: string[];
    path?: string[];
    mstEdges?: Array<{ source: string; target: string }>;
  };
  nodeLabels?: Record<string, number>;
  showEdgeWeights?: boolean;
}

export default function GraphVisualizer({ graph, highlights, nodeLabels, showEdgeWeights = true }: GraphVisualizerProps) {
  const { current = [], visiting = [], visited = [], path = [] } = highlights;

  const svgRef = useRef<SVGSVGElement>(null);
  const draggingIdRef = useRef<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [positionOverrides, setPositionOverrides] = useState<Record<string, { x: number; y: number }>>({});

  // Reset overrides when the graph topology changes
  const nodeIdsKey = graph.nodes.map(n => n.id).join(',');
  useEffect(() => {
    setPositionOverrides({});
  }, [nodeIdsKey]);

  const getPos = (node: GraphNode) => positionOverrides[node.id] ?? node.position;

  // Attach drag handlers to window so dragging works even when cursor leaves the SVG
  useEffect(() => {
    const domToSVG = (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      return pt.matrixTransform(ctm.inverse());
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!draggingIdRef.current) return;
      const pos = domToSVG(e.clientX, e.clientY);
      setPositionOverrides(prev => ({ ...prev, [draggingIdRef.current!]: { x: pos.x, y: pos.y } }));
    };

    const onMouseUp = () => {
      draggingIdRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    draggingIdRef.current = nodeId;
    setIsDragging(true);
  };

  const getNodeFill = (nodeId: string): string => {
    if (path.includes(nodeId)) return '#10b981';      // emerald — in final path
    if (current.includes(nodeId)) return '#8b5cf6';   // violet — source/current node
    if (visiting.includes(nodeId)) return '#f59e0b';  // amber — adjacent neighbor
    if (visited.includes(nodeId)) return '#3b82f6';   // blue — already visited
    return '#94a3b8';                                  // slate — default
  };

  const getNodeStrokeColor = (nodeId: string): string => {
    if (path.includes(nodeId)) return '#059669';
    if (current.includes(nodeId)) return '#7c3aed';
    if (visiting.includes(nodeId)) return '#d97706';
    if (visited.includes(nodeId)) return '#2563eb';
    return '#64748b';
  };

  const getEdgeColor = (sourceId: string, targetId: string): string => {
    if (highlights.mstEdges) {
      const isMSTEdge = highlights.mstEdges.some(
        e => (e.source === sourceId && e.target === targetId) ||
             (e.source === targetId && e.target === sourceId)
      );
      return isMSTEdge ? '#10b981' : '#cbd5e1';
    }

    const isPathEdge =
      (path.includes(sourceId) && path.includes(targetId)) ||
      (visited.includes(sourceId) && visited.includes(targetId));

    return isPathEdge ? '#60a5fa' : '#cbd5e1';
  };

  const getEdgeWidth = (sourceId: string, targetId: string): number => {
    if (highlights.mstEdges) {
      const isMSTEdge = highlights.mstEdges.some(
        e => (e.source === sourceId && e.target === targetId) ||
             (e.source === targetId && e.target === sourceId)
      );
      return isMSTEdge ? 4 : 2;
    }
    const isPathEdge =
      (path.includes(sourceId) && path.includes(targetId)) ||
      (visited.includes(sourceId) && visited.includes(targetId));
    return isPathEdge ? 3 : 2;
  };

  const NODE_RADIUS = 20;
  const VB_PADDING = 44;
  const LABEL_RIGHT_EXTRA = nodeLabels ? 36 : 0;

  // Compute viewBox from effective positions (includes drag overrides)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  graph.nodes.forEach(n => {
    const pos = getPos(n);
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x);
    maxY = Math.max(maxY, pos.y);
  });
  if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 400; maxY = 400; }
  const vbX = minX - NODE_RADIUS - VB_PADDING;
  const vbY = minY - NODE_RADIUS - VB_PADDING;
  const vbW = maxX - minX + (NODE_RADIUS + VB_PADDING) * 2 + LABEL_RIGHT_EXTRA;
  const vbH = maxY - minY + (NODE_RADIUS + VB_PADDING) * 2;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-5 sm:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Graph Visualization
        </h2>
      </div>

      {/* Scrollable SVG area */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-auto max-h-[280px] sm:max-h-[460px] border border-slate-100 dark:border-slate-700/50">
        <svg
          ref={svgRef}
          style={{ width: `${vbW}px`, height: `${vbH}px`, minWidth: '100%', display: 'block', cursor: isDragging ? 'grabbing' : 'default' }}
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Drop shadow filter for nodes */}
          <defs>
            <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Edges */}
          {graph.edges.map((edge, index) => {
            const sourceNode = graph.nodes.find(n => n.id === edge.source);
            const targetNode = graph.nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return null;

            const sp = getPos(sourceNode);
            const tp = getPos(targetNode);
            const midX = (sp.x + tp.x) / 2;
            const midY = (sp.y + tp.y) / 2;
            const dx = tp.x - sp.x;
            const dy = tp.y - sp.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const PERP_OFFSET = 13;
            const labelX = midX + (-dy / len) * PERP_OFFSET;
            const labelY = midY + (dx / len) * PERP_OFFSET;

            const edgeColor = getEdgeColor(edge.source, edge.target);
            const edgeWidth = getEdgeWidth(edge.source, edge.target);

            return (
              <g key={`edge-${index}`}>
                <line
                  x1={sp.x}
                  y1={sp.y}
                  x2={tp.x}
                  y2={tp.y}
                  stroke={edgeColor}
                  strokeWidth={edgeWidth}
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }}
                />
                {showEdgeWeights && edge.weight !== undefined && (
                  <g>
                    <circle
                      cx={labelX}
                      cy={labelY}
                      r="11"
                      fill="white"
                      stroke="#e2e8f0"
                      strokeWidth="1.5"
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="10"
                      fontWeight="700"
                      fill="#475569"
                    >
                      {edge.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {graph.nodes.map((node) => {
            const label = nodeLabels?.[node.id];
            const labelText = label === undefined ? null : label === Infinity ? '∞' : String(label);
            const nodeFill = getNodeFill(node.id);
            const nodeStroke = getNodeStrokeColor(node.id);
            const isActive = current.includes(node.id) || visiting.includes(node.id);
            const pos = getPos(node);

            return (
              // <g> has no transform — circle and text are positioned via cx/cy and x/y
              <g
                key={node.id}
                style={{ cursor: 'grab' }}
                onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="20"
                  fill={nodeFill}
                  stroke={nodeStroke}
                  strokeWidth="2.5"
                  filter="url(#node-shadow)"
                  style={{
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    // Explicit origin in SVG-space px so scale stays centered on the circle
                    transformOrigin: `${pos.x}px ${pos.y}px`,
                    transition: 'fill 0.25s ease, transform 0.25s ease, stroke 0.25s ease',
                  }}
                />
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="700"
                  fill="white"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.id}
                </text>
                {labelText !== null && (
                  <g>
                    <rect
                      x={pos.x + 22}
                      y={pos.y - 9}
                      width="28"
                      height="18"
                      rx="5"
                      fill="#e2e8f0"
                    />
                    <text
                      x={pos.x + 36}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="10"
                      fontWeight="700"
                      fill="#1e293b"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
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
      <div className="mt-4 flex items-center justify-center flex-wrap gap-4 text-xs">
        {[
          { color: 'bg-slate-400', label: 'Default' },
          { color: 'bg-violet-500', label: 'Current' },
          { color: 'bg-amber-500', label: 'Neighbor' },
          { color: 'bg-blue-500', label: 'Visited' },
          { color: 'bg-emerald-500', label: 'Path' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center space-x-1.5">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
