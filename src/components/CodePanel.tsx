import type { Complexity } from '../types';

interface CodePanelProps {
  /** Algorithm code (C++ syntax) - can be string or array of lines */
  code: string | string[];
  /** Currently executing line number (1-indexed) */
  activeLine: number;
  /** Time and space complexity information */
  complexity?: Complexity;
}

export default function CodePanel({ code, activeLine, complexity }: CodePanelProps) {
  const lines = Array.isArray(code) ? code : code.split('\n');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-5 sm:p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Algorithm Code
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
          C++
        </span>
      </div>

      {/* Code Container — always dark for premium terminal feel */}
      <div
        className="h-[260px] sm:h-[340px] overflow-auto code-scroll bg-slate-900 rounded-xl border border-slate-700/50"
      >
        <pre className="text-sm font-mono leading-relaxed p-4">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const isActive = lineNumber === activeLine;

            return (
              <div
                key={index}
                className={`flex items-stretch min-h-[1.625rem] rounded transition-all duration-150 ${
                  isActive
                    ? 'bg-yellow-400/15'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Active line indicator bar */}
                <span
                  className={`w-0.5 flex-shrink-0 rounded-full mr-3 transition-all duration-200 ${
                    isActive ? 'bg-yellow-400' : 'bg-transparent'
                  }`}
                />

                {/* Line Number */}
                <span
                  className={`inline-block w-8 flex-shrink-0 text-right pr-4 select-none transition-colors duration-150 ${
                    isActive
                      ? 'text-yellow-400 font-semibold'
                      : 'text-slate-600'
                  }`}
                >
                  {lineNumber}
                </span>

                {/* Code Line */}
                <span
                  className={`flex-1 whitespace-pre transition-all duration-150 ${
                    isActive
                      ? 'text-white font-medium'
                      : 'text-slate-400 opacity-75'
                  }`}
                >
                  {line || ' '}
                </span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>
          {lines.length} {lines.length === 1 ? 'line' : 'lines'}
        </span>
        {activeLine > 0 && (
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
            <span>Line {activeLine}</span>
          </span>
        )}
      </div>

      {/* Complexity Table */}
      {complexity && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Complexity
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Best</div>
              <div className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400">{complexity.best}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Average</div>
              <div className="text-sm font-mono font-semibold text-amber-600 dark:text-amber-400">{complexity.average}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Worst</div>
              <div className="text-sm font-mono font-semibold text-red-600 dark:text-red-400">{complexity.worst}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Space</div>
              <div className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">{complexity.space}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
