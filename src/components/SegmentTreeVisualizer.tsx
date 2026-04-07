import { memo } from 'react';
import type { SegmentTreeStep } from '../types';

interface Props {
  nodes: SegmentTreeStep['nodes'];
  sourceArray: number[];
  highlights: SegmentTreeStep['highlights'];
  phase: SegmentTreeStep['phase'];
  metadata?: SegmentTreeStep['metadata'];
}

const NODE_W = 72;
const NODE_H = 38;
const LEVEL_H = 84;
const TOP_PAD = 20;
const VIEW_W = 900;

function getPos(nodeIdx: number) {
  const level = Math.floor(Math.log2(nodeIdx));
  const posInLevel = nodeIdx - (1 << level);
  const nodesAtLevel = 1 << level;
  const x = ((posInLevel + 0.5) / nodesAtLevel) * VIEW_W;
  const y = TOP_PAD + level * LEVEL_H + NODE_H / 2;
  return { x, y };
}

function nodeColor(nodeIdx: number, h: Props['highlights']): string {
  if (h.active?.includes(nodeIdx)) return '#f59e0b';   // amber  — being processed
  if (h.inRange?.includes(nodeIdx)) return '#10b981';  // emerald — full overlap
  if (h.outOfRange?.includes(nodeIdx)) return '#64748b'; // slate — no overlap
  if (h.path?.includes(nodeIdx)) return '#8b5cf6';     // violet — partial / update path
  if (h.computed?.includes(nodeIdx)) return '#3b82f6'; // blue   — built
  return '#94a3b8'; // slate-400 — pending
}

export default memo(function SegmentTreeVisualizer({
  nodes, sourceArray, highlights, phase, metadata,
}: Props) {
  const maxLevel = nodes.reduce((m, n) => Math.max(m, Math.floor(Math.log2(n.nodeIdx))), 0);
  const viewH = TOP_PAD + maxLevel * LEVEL_H + NODE_H + 20;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft overflow-hidden flex flex-col">
      {/* Phase header */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${
          phase === 'build'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : phase === 'query'
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
            : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
        }`}>
          {phase === 'build' ? 'Build' : phase === 'query' ? 'Range Query' : 'Point Update'}
        </span>

        {metadata?.description && (
          <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
            {metadata.description}
          </span>
        )}

        {phase === 'query' && metadata?.queryRange && (
          <span className="ml-auto text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            [{metadata.queryRange[0]}, {metadata.queryRange[1]}]
            {metadata.queryResult !== undefined && (
              <span className="text-emerald-600 dark:text-emerald-400"> = {metadata.queryResult}</span>
            )}
          </span>
        )}

        {phase === 'update' && metadata?.updateIndex !== undefined && (
          <span className="ml-auto text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            arr[{metadata.updateIndex}] ← {metadata.updateValue}
          </span>
        )}
      </div>

      {/* Tree SVG */}
      <div className="overflow-x-auto flex-1">
        <svg
          viewBox={`0 0 ${VIEW_W} ${viewH}`}
          width={VIEW_W}
          height={viewH}
          className="min-w-full"
          aria-label="Segment tree visualization"
        >
          {/* Edges */}
          {nodes
            .filter(n => n.nodeIdx > 1)
            .map(n => {
              const parent = nodes.find(p => p.nodeIdx === Math.floor(n.nodeIdx / 2));
              if (!parent) return null;
              const cp = getPos(n.nodeIdx);
              const pp = getPos(parent.nodeIdx);
              return (
                <line
                  key={`e-${n.nodeIdx}`}
                  x1={pp.x}
                  y1={pp.y + NODE_H / 2}
                  x2={cp.x}
                  y2={cp.y - NODE_H / 2}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                />
              );
            })}

          {/* Nodes */}
          {nodes.map(n => {
            const { x, y } = getPos(n.nodeIdx);
            const fill = nodeColor(n.nodeIdx, highlights);
            const isActive = highlights.active?.includes(n.nodeIdx);
            return (
              <g key={n.nodeIdx} transform={`translate(${x - NODE_W / 2},${y - NODE_H / 2})`}>
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx="8"
                  fill={fill}
                  opacity={isActive ? 1 : 0.88}
                  stroke={isActive ? '#1e293b' : 'none'}
                  strokeWidth="2"
                />
                {/* Range label */}
                <text
                  x={NODE_W / 2}
                  y={NODE_H / 2 - 5}
                  textAnchor="middle"
                  fill="white"
                  fontSize="9"
                  fontFamily="monospace"
                  opacity="0.9"
                >
                  [{n.left},{n.right}]
                </text>
                {/* Value */}
                <text
                  x={NODE_W / 2}
                  y={NODE_H / 2 + 9}
                  textAnchor="middle"
                  fill="white"
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {n.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Source array */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
          Source Array
        </p>
        <div className="flex gap-1 flex-wrap">
          {sourceArray.map((val, i) => {
            const isUpdateIdx = phase === 'update' && metadata?.updateIndex === i;
            return (
              <div
                key={i}
                className={`flex flex-col items-center min-w-[34px] rounded-lg overflow-hidden border ${
                  isUpdateIdx
                    ? 'border-violet-400 dark:border-violet-500'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className={`w-full text-center text-xs font-mono font-bold py-1.5 ${
                  isUpdateIdx
                    ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}>
                  {val}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 py-0.5">{i}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-x-4 gap-y-1.5">
        <LegendDot color="#f59e0b" label="Active" />
        {phase === 'build' && (
          <>
            <LegendDot color="#3b82f6" label="Computed" />
            <LegendDot color="#94a3b8" label="Pending" />
          </>
        )}
        {phase === 'query' && (
          <>
            <LegendDot color="#10b981" label="Full overlap" />
            <LegendDot color="#64748b" label="No overlap" />
            <LegendDot color="#8b5cf6" label="Partial" />
          </>
        )}
        {phase === 'update' && (
          <>
            <LegendDot color="#8b5cf6" label="Update path" />
            <LegendDot color="#3b82f6" label="Computed" />
          </>
        )}
      </div>
    </div>
  );
});

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
