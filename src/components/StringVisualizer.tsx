import { memo } from 'react';
import type { StringStep } from '../types';

interface StringVisualizerProps {
  text: string;
  pattern?: string;
  alignOffset?: number;
  auxTable?: StringStep['auxTable'];
  highlights: StringStep['highlights'];
  metadata?: StringStep['metadata'];
}

const BOX = 'w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center rounded-lg border-2 font-bold text-xs sm:text-sm transition-all duration-200';

function StringVisualizer({ text, pattern, alignOffset = 0, auxTable, highlights, metadata }: StringVisualizerProps) {
  const found = new Set(highlights.found ?? []);
  const mismatch = new Set(highlights.mismatch ?? []);
  const compare = new Set(highlights.compare ?? []);
  const match = new Set(highlights.match ?? []);
  const pCompare = new Set(highlights.patternCompare ?? []);
  const pMatch = new Set(highlights.patternMatch ?? []);

  const textStyle = (i: number): string => {
    if (found.has(i)) return 'bg-emerald-500 border-emerald-600 text-white';
    if (mismatch.has(i)) return 'bg-rose-500 border-rose-600 text-white';
    if (compare.has(i)) return 'bg-amber-400 border-amber-500 text-white scale-110';
    if (match.has(i)) return 'bg-blue-500 border-blue-600 text-white';
    return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300';
  };

  const patternStyle = (i: number): string => {
    if (pCompare.has(i)) return 'bg-amber-400 border-amber-500 text-white scale-110';
    if (pMatch.has(i)) return 'bg-blue-500 border-blue-600 text-white';
    return 'bg-violet-500 border-violet-600 text-white';
  };

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-4 sm:p-6 flex flex-col min-h-[220px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          String Visualization
        </h2>
        {metadata?.matchPositions !== undefined && (
          <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg font-semibold text-xs sm:text-sm ring-1 ring-emerald-200 dark:ring-emerald-800">
            {metadata.matchPositions.length} match{metadata.matchPositions.length === 1 ? '' : 'es'}
          </span>
        )}
        {metadata?.longestPalindrome !== undefined && (
          <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg font-semibold text-xs sm:text-sm ring-1 ring-emerald-200 dark:ring-emerald-800 font-mono">
            best: {metadata.longestPalindrome}
          </span>
        )}
      </div>

      {/* Step description */}
      {metadata?.description && (
        <div className="mb-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg truncate">
          {metadata.description}
        </div>
      )}

      <div className="flex-1 overflow-x-auto flex flex-col justify-center">
        <div className="mx-auto space-y-1">
          {/* Index labels */}
          <div className="flex gap-1">
            {text.split('').map((_, i) => (
              <div key={`idx-${i}`} className="w-8 sm:w-9 shrink-0 text-center text-[10px] font-mono text-slate-400 dark:text-slate-500">
                {i}
              </div>
            ))}
          </div>

          {/* Text row */}
          <div className="flex gap-1">
            {text.split('').map((ch, i) => (
              <div key={`t-${i}`} className={`${BOX} ${textStyle(i)}`} aria-label={`Text ${i}: ${ch}`}>
                {ch}
              </div>
            ))}
          </div>

          {/* Pattern row, aligned under the text */}
          {pattern && (
            <div className="flex gap-1">
              {Array.from({ length: alignOffset }, (_, i) => (
                <div key={`sp-${i}`} className="w-8 sm:w-9 shrink-0" />
              ))}
              {pattern.split('').map((ch, i) => (
                <div key={`p-${i}`} className={`${BOX} ${patternStyle(i)}`} aria-label={`Pattern ${i}: ${ch}`}>
                  {ch}
                </div>
              ))}
            </div>
          )}

          {/* Auxiliary table (LPS / Z / hashes) */}
          {auxTable && (
            <div className="flex gap-1 items-center pt-2">
              <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 uppercase pr-1 shrink-0 w-10 text-right">
                {auxTable.label}
              </span>
              {auxTable.values.map((v, i) => (
                <div
                  key={`aux-${i}`}
                  className={`
                    min-w-8 sm:min-w-9 h-7 shrink-0 px-1 flex items-center justify-center rounded-md border
                    font-mono text-[11px] font-semibold transition-all duration-200
                    ${auxTable.highlight?.includes(i)
                      ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 text-amber-700 dark:text-amber-300'
                      : v === null
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-dashed border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}
                  `}
                >
                  {v === null ? '·' : v}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center flex-wrap gap-3 sm:gap-5 text-xs">
        {[
          { color: 'bg-amber-400 border-amber-500', label: 'Comparing' },
          { color: 'bg-blue-500 border-blue-600', label: 'Matched' },
          { color: 'bg-rose-500 border-rose-600', label: 'Mismatch' },
          { color: 'bg-emerald-500 border-emerald-600', label: 'Found' },
          { color: 'bg-violet-500 border-violet-600', label: 'Pattern' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center space-x-1.5">
            <div className={`w-3.5 h-3.5 rounded-md border-2 ${color}`} />
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(StringVisualizer);
