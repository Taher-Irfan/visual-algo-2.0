export type Step = {
  array: number[];
  activeLine: number;
  highlights: {
    comparing?: number[];
    swapping?: number[];
    sorted?: number[];
  };
  operations: {
    comparisons: number;
    swaps: number;
  };
  metadata?: {
    target?: number;
    found?: boolean;
    foundIndex?: number;
    currentIndex?: number;
    searchRange?: {
      left: number;
      right: number;
      mid?: number;
    };
    // Sorting algorithm state variables
    i?: number;
    j?: number;
    key?: number;
    minIdx?: number;
    pivot?: number;
    low?: number;
    high?: number;
    l?: number;
    r?: number;
    m?: number;
    k?: number;
  };
};

export type Complexity = {
  best: string;
  average: string;
  worst: string;
  space: string;
};

export type Algorithm = {
  id: string;
  name: string;
  generateSteps: (array: number[]) => Step[];
  code: string;
  complexity?: Complexity;
};

export type GraphNode = {
  id: string;
  position: {
    x: number;
    y: number;
  };
};

export type GraphEdge = {
  source: string;
  target: string;
  weight?: number;
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphStep = {
  graph: Graph;
  activeLine: number;
  highlights: {
    current?: string[];
    visiting?: string[];
    visited?: string[];
    path?: string[];
    mstEdges?: Array<{ source: string; target: string }>;
  };
  metadata?: {
    queue?: string[];
    stack?: string[];
    currentNode?: string;
    startNode?: string;
    distances?: Record<string, number>;
    previous?: Record<string, string | null>;
    levels?: Record<string, number>;
    keys?: Record<string, number>;
  };
};

export type GraphAlgorithm = {
  id: string;
  name: string;
  generateSteps: (graph: Graph, startNode: string) => GraphStep[];
  code: string;
};

export type SegmentTreeNode = {
  nodeIdx: number;  // 1-indexed position in tree array
  left: number;     // range left bound (0-indexed)
  right: number;    // range right bound (0-indexed)
  value: number;    // aggregate (sum)
};

export type SegmentTreeStep = {
  nodes: SegmentTreeNode[];
  sourceArray: number[];
  activeLine: number;
  phase: 'build' | 'query' | 'update';
  highlights: {
    active?: number[];     // node indices being processed
    computed?: number[];   // fully computed nodes
    outOfRange?: number[]; // returned 0 (no overlap)
    inRange?: number[];    // full overlap (returned value)
    path?: number[];       // partial overlap / update path
  };
  metadata?: {
    queryRange?: [number, number];
    queryResult?: number;
    updateIndex?: number;
    updateValue?: number;
    description?: string;
  };
  operations: {
    comparisons: number;
    accesses: number;
  };
};

export type SegmentTreeAlgorithm = {
  id: string;
  name: string;
  generateSteps: (array: number[]) => SegmentTreeStep[];
  code: string;
};

export type PlaybackMode = 'continuous' | 'step';

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'finished';

export interface VisualizerState {
  algorithm: string;
  arraySize: number;
  speed: number;
  array: number[];
  steps: Step[];
  currentStepIndex: number;
  playbackStatus: PlaybackStatus;
  playbackMode: PlaybackMode;
  isDarkMode: boolean;
  isSoundEnabled: boolean;
}
