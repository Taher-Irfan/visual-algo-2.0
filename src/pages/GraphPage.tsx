import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GraphVisualizer from '../components/GraphVisualizer';
import CodePanel from '../components/CodePanel';
import PlaybackControls from '../components/PlaybackControls';
import { getDefaultAlgorithm, type AlgorithmCategory } from '../algorithms/registry';
import { getGraphAlgorithm, getDefaultGraphAlgorithm } from '../algorithms/graphRegistry';
import { generateGraph, type GraphLayoutType } from '../utils/graph';
import { soundEngine } from '../utils/sound';
import { useDarkMode, useSound } from '../hooks';
import type { GraphStep, Graph } from '../types';

interface GraphPlaybackController {
  currentStep: GraphStep;
  currentStepIndex: number;
  playbackStatus: 'idle' | 'playing' | 'paused' | 'finished';
  playbackMode: 'continuous' | 'step';
  speed: number;
  canStepForward: boolean;
  canStepBackward: boolean;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  replay: () => void;
  setPlaybackMode: (mode: 'continuous' | 'step') => void;
  setSpeed: (speed: number) => void;
}

function useGraphPlaybackController(steps: GraphStep[], defaultGraph: Graph): GraphPlaybackController {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState<'idle' | 'playing' | 'paused' | 'finished'>('idle');
  const [playbackMode, setPlaybackMode] = useState<'continuous' | 'step'>('continuous');
  const [speed, setSpeed] = useState(1);

  const currentStep = steps[currentStepIndex] || {
    graph: defaultGraph,
    activeLine: 0,
    highlights: { visiting: [], visited: [], path: [] },
    metadata: {},
  };

  const canStepForward = currentStepIndex < steps.length - 1;
  const canStepBackward = currentStepIndex > 0;

  useEffect(() => {
    if (playbackStatus !== 'playing' || playbackMode !== 'continuous') return;

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= steps.length - 1) {
          setPlaybackStatus('finished');
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [playbackStatus, playbackMode, speed, steps.length]);

  const play = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setPlaybackStatus('playing');
  }, [currentStepIndex, steps.length]);

  const pause = useCallback(() => {
    setPlaybackStatus('paused');
  }, []);

  const stepForward = useCallback(() => {
    if (canStepForward) {
      setCurrentStepIndex(prev => prev + 1);
      setPlaybackStatus('paused');
    }
  }, [canStepForward]);

  const stepBackward = useCallback(() => {
    if (canStepBackward) {
      setCurrentStepIndex(prev => prev - 1);
      setPlaybackStatus('paused');
    }
  }, [canStepBackward]);

  const replay = useCallback(() => {
    setCurrentStepIndex(0);
    setPlaybackStatus('idle');
  }, []);

  return {
    currentStep,
    currentStepIndex,
    playbackStatus,
    playbackMode,
    speed,
    canStepForward,
    canStepBackward,
    play,
    pause,
    stepForward,
    stepBackward,
    replay,
    setPlaybackMode,
    setSpeed,
  };
}

function GraphPage() {
  const { algorithm: algorithmParam } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();
  
  const [category] = useState<AlgorithmCategory>('graph');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithmParam || 'bfs');
  const [steps, setSteps] = useState<GraphStep[]>([]);
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  const [isSoundEnabled, setIsSoundEnabled] = useSound();
  const [startNode, setStartNode] = useState('0');
  const [graphLayout, setGraphLayout] = useState<GraphLayoutType>('tree');
  const [nodeCount, setNodeCount] = useState(7);
  const [currentGraph, setCurrentGraph] = useState<Graph>(() => generateGraph(7, 'tree'));

  const {
    currentStep,
    currentStepIndex,
    playbackStatus,
    playbackMode,
    speed,
    canStepForward,
    canStepBackward,
    play,
    pause,
    stepForward,
    stepBackward,
    replay,
    setPlaybackMode,
    setSpeed,
  } = useGraphPlaybackController(steps, currentGraph);

  useEffect(() => {
    if (algorithmParam && algorithmParam !== selectedAlgorithm) {
      setSelectedAlgorithm(algorithmParam);
    }
  }, [algorithmParam, selectedAlgorithm]);

  useEffect(() => {
    soundEngine.initialize();
  }, []);

  useEffect(() => {
    const newGraph = generateGraph(nodeCount, graphLayout);
    setCurrentGraph(newGraph);
    if (parseInt(startNode) >= nodeCount) {
      setStartNode('0');
    }
  }, [nodeCount, graphLayout]);

  const handleGenerateSteps = useCallback(() => {
    const algorithm = getGraphAlgorithm(selectedAlgorithm);
    if (algorithm) {
      const newSteps = algorithm.generateSteps(currentGraph, startNode);
      setSteps(newSteps);
    }
  }, [selectedAlgorithm, startNode, currentGraph]);

  useEffect(() => {
    handleGenerateSteps();
  }, [handleGenerateSteps]);

  useEffect(() => {
    if (currentStepIndex === 0 || steps.length === 0) return;

    if (currentStep.highlights.path?.length) {
      soundEngine.playSuccess();
    } else if (currentStep.highlights.visiting?.length) {
      soundEngine.playVisit();
    } else if (currentStep.highlights.visited?.length) {
      soundEngine.playCompare();
    }
  }, [currentStepIndex, steps.length, currentStep.highlights]);

  const handleCategoryChange = (newCategory: AlgorithmCategory) => {
    const defaultAlgo = getDefaultAlgorithm(newCategory);
    setSelectedAlgorithm(defaultAlgo);
    
    if (newCategory === 'sorting') {
      navigate(`/sorting/${defaultAlgo}`);
    } else if (newCategory === 'searching') {
      navigate(`/searching/${defaultAlgo}`);
    } else if (newCategory === 'graph') {
      const graphDefaultAlgo = getDefaultGraphAlgorithm();
      navigate(`/graph/${graphDefaultAlgo}`);
    } else if (newCategory === 'tree') {
      navigate('/tree/segment');
    }
  };

  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
    navigate(`/graph/${algorithm}`);
  };

  const algorithm = getGraphAlgorithm(selectedAlgorithm);

  if (!algorithm) {
    return <div>Algorithm not found</div>;
  }

  // Node labels: BFS shows level, Dijkstra shows cost from source
  const nodeLabels: Record<string, number> | undefined = (() => {
    if (selectedAlgorithm === 'bfs' && currentStep.metadata?.levels) {
      return currentStep.metadata.levels;
    }
    if (selectedAlgorithm === 'dijkstra' && currentStep.metadata?.distances) {
      return currentStep.metadata.distances;
    }
    return undefined;
  })();

  // DFS and BFS don't need edge weights displayed
  const showEdgeWeights = selectedAlgorithm !== 'dfs' && selectedAlgorithm !== 'bfs';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <Navbar
        category={category}
        selectedAlgorithm={selectedAlgorithm}
        onCategoryChange={handleCategoryChange}
        onAlgorithmChange={handleAlgorithmChange}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        isSoundEnabled={isSoundEnabled}
        onSoundToggle={() => setIsSoundEnabled(!isSoundEnabled)}
      />

      <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:h-[calc(100vh-140px)]">
          <div className="lg:col-span-2 flex flex-col space-y-4 sm:space-y-6 lg:min-h-0 lg:overflow-y-auto">
            <GraphVisualizer
              graph={currentStep.graph}
              highlights={currentStep.highlights}
              nodeLabels={nodeLabels}
              showEdgeWeights={showEdgeWeights}
            />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-5 sm:p-6">
              <PlaybackControls
                playbackStatus={playbackStatus}
                playbackMode={playbackMode}
                onPlay={play}
                onPause={pause}
                onStepForward={stepForward}
                onStepBackward={stepBackward}
                onReplay={replay}
                onModeChange={setPlaybackMode}
                canStepForward={canStepForward}
                canStepBackward={canStepBackward}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-4 sm:space-y-6 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                  Controls
                </h3>

                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Speed
                      </label>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                        {speed}×
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.5"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Number of Nodes
                      </label>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                        {nodeCount}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="1"
                      value={nodeCount}
                      onChange={(e) => setNodeCount(Number(e.target.value))}
                      disabled={playbackStatus === 'playing'}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                      Graph Layout
                    </label>
                    <select
                      value={graphLayout}
                      onChange={(e) => setGraphLayout(e.target.value as GraphLayoutType)}
                      disabled={playbackStatus === 'playing'}
                      className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 cursor-pointer"
                    >
                      <option value="tree">Tree</option>
                      <option value="circular">Circular</option>
                      <option value="grid">Grid</option>
                      <option value="mesh">Mesh</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                      Start Node
                    </label>
                    <select
                      value={startNode}
                      onChange={(e) => setStartNode(e.target.value)}
                      disabled={playbackStatus === 'playing'}
                      className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 cursor-pointer"
                    >
                      {currentGraph.nodes.map(node => (
                        <option key={node.id} value={node.id}>
                          Node {node.id}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {currentStep.metadata && (
                <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                    Algorithm State
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
                    {/* Current Node */}
                    {currentStep.metadata.currentNode !== undefined && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Current</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            {currentStep.metadata.currentNode !== undefined ? `Node ${currentStep.metadata.currentNode}` : '—'}
                          </span>
                        </div>
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Visited</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            {currentStep.highlights.visited?.length ?? 0} / {currentStep.graph.nodes.length}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* BFS: Level of current node */}
                    {selectedAlgorithm === 'bfs' && currentStep.metadata.levels && currentStep.metadata.currentNode !== undefined && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Level</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            {currentStep.metadata.levels[currentStep.metadata.currentNode] ?? '—'}
                          </span>
                        </div>
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Queue Size</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            {currentStep.metadata.queue?.length ?? 0}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* DFS: Stack depth */}
                    {selectedAlgorithm === 'dfs' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Depth</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            {currentStep.metadata.stack?.length ?? 0}
                          </span>
                        </div>
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Start</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            Node {currentStep.metadata.startNode}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Queue (BFS / Dijkstra / Prim) */}
                    {currentStep.metadata.queue && selectedAlgorithm !== 'dfs' && (
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wide">
                          Priority Queue
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                          {currentStep.metadata.queue.length > 0 ? `[${currentStep.metadata.queue.join(', ')}]` : '(empty)'}
                        </span>
                      </div>
                    )}

                    {/* Call Stack (DFS) */}
                    {currentStep.metadata.stack && selectedAlgorithm === 'dfs' && (
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wide">
                          Call Stack
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                          {currentStep.metadata.stack.length > 0 ? `[${currentStep.metadata.stack.join(' → ')}]` : '(empty)'}
                        </span>
                      </div>
                    )}

                    {/* Dijkstra: Current node distance + parent */}
                    {selectedAlgorithm === 'dijkstra' && currentStep.metadata.currentNode !== undefined && currentStep.metadata.distances && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Dist(cur)</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            {(() => { const d = currentStep.metadata!.distances![currentStep.metadata!.currentNode!]; return d === Infinity ? '∞' : d; })()}
                          </span>
                        </div>
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">Parent</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            {currentStep.metadata.previous?.[currentStep.metadata.currentNode] ?? '—'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Dijkstra: Full distances table */}
                    {currentStep.metadata.distances && (
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wide">
                          Distances from {currentStep.metadata.startNode}
                        </span>
                        <div className="text-xs font-mono text-slate-900 dark:text-white space-y-0.5">
                          {Object.entries(currentStep.metadata.distances).map(([node, dist]) => (
                            <div key={node} className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Node {node}</span>
                              <span className="font-bold">{dist === Infinity ? '∞' : dist}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prim's: MST size + Key values */}
                    {selectedAlgorithm === 'prim' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">MST Edges</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            {currentStep.highlights.mstEdges?.length ?? 0}
                          </span>
                        </div>
                        <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-0.5">In MST</span>
                          <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                            {currentStep.highlights.path?.length ?? 0} / {currentStep.graph.nodes.length}
                          </span>
                        </div>
                      </div>
                    )}
                    {selectedAlgorithm === 'prim' && currentStep.metadata.keys && (
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5 uppercase tracking-wide">
                          Key Values (min edge weight)
                        </span>
                        <div className="text-xs font-mono text-slate-900 dark:text-white space-y-0.5">
                          {Object.entries(currentStep.metadata.keys).map(([node, k]) => (
                            <div key={node} className="flex justify-between">
                              <span className="text-slate-500 dark:text-slate-400">Node {node}</span>
                              <span className="font-bold">{k === Infinity ? '∞' : k}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <CodePanel
              code={algorithm.code}
              activeLine={currentStep.activeLine}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default GraphPage;
