import { memo } from 'react';
import type { GeometryStep } from '../types';

interface GeometryVisualizerProps {
  points: GeometryStep['points'];
  hull: number[];
  closed?: boolean;
  highlights: GeometryStep['highlights'];
  metadata?: GeometryStep['metadata'];
}

function GeometryVisualizer({ points, hull, closed, highlights, metadata }: GeometryVisualizerProps) {
  const current = new Set(highlights.current ?? []);
  const candidate = new Set(highlights.candidate ?? []);
  const rejected = new Set(highlights.rejected ?? []);
  const onHull = new Set(hull);

  const pointFill = (i: number): string => {
    if (current.has(i)) return '#f59e0b';   // amber — being processed
    if (candidate.has(i)) return '#8b5cf6'; // violet — candidate
    if (rejected.has(i)) return '#f43f5e';  // rose — popped/rejected
    if (onHull.has(i)) return closed ? '#10b981' : '#3b82f6'; // emerald when done, blue while building
    return '#94a3b8';                        // slate — plain point
  };

  const pointRadius = (i: number): number =>
    current.has(i) || candidate.has(i) ? 2.6 : onHull.has(i) ? 2.2 : 1.7;

  // Hull polyline (closed polygon on the final step)
  const hullPath = hull.length > 1
    ? hull.map((idx, k) => `${k === 0 ? 'M' : 'L'} ${points[idx].x} ${points[idx].y}`).join(' ') + (closed ? ' Z' : '')
    : '';

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-4 sm:p-6 flex flex-col min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Convex Hull Visualization
        </h2>
        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-mono font-semibold text-xs sm:text-sm">
          hull: {hull.length} / {points.length}
        </span>
      </div>

      {/* Step description */}
      {metadata?.description && (
        <div className="mb-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg truncate">
          {metadata.description}
        </div>
      )}

      {/* Point cloud */}
      <div className="flex-1 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full max-w-[480px] aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Hull edges */}
          {hullPath && (
            <path
              d={hullPath}
              fill={closed ? 'rgba(16, 185, 129, 0.08)' : 'none'}
              stroke={closed ? '#10b981' : '#3b82f6'}
              strokeWidth="0.8"
              strokeLinejoin="round"
              style={{ transition: 'stroke 0.3s ease' }}
            />
          )}

          {/* Probe lines: current → candidate while comparing */}
          {highlights.current?.length === 1 && highlights.candidate?.length === 1 && !closed && (
            <line
              x1={points[highlights.current[0]].x}
              y1={points[highlights.current[0]].y}
              x2={points[highlights.candidate[0]].x}
              y2={points[highlights.candidate[0]].y}
              stroke="#8b5cf6"
              strokeWidth="0.5"
              strokeDasharray="2 1.5"
            />
          )}

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={pointRadius(i)}
                fill={pointFill(i)}
                opacity={rejected.has(i) ? 0.55 : 1}
                style={{ transition: 'fill 0.2s ease, r 0.2s ease' }}
              />
              <text
                x={p.x}
                y={p.y - 3.2}
                textAnchor="middle"
                fontSize="3"
                fontWeight="600"
                fill="#64748b"
                style={{ userSelect: 'none' }}
              >
                {i}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center flex-wrap gap-3 sm:gap-5 text-xs">
        {[
          { color: 'bg-slate-400', label: 'Point' },
          { color: 'bg-amber-400', label: 'Processing' },
          { color: 'bg-violet-500', label: 'Candidate' },
          { color: 'bg-blue-500', label: 'Hull chain' },
          { color: 'bg-rose-500', label: 'Rejected' },
          { color: 'bg-emerald-500', label: 'Final hull' },
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

export default memo(GeometryVisualizer);
