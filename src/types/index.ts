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
    // Heap sort state variables
    heapSize?: number;
    largest?: number;
    phase?: 'build-heap' | 'sort-down';
    // Shell / Radix / Counting sort state variables
    gap?: number;
    exp?: number;
    digit?: number;
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
    // Kruskal's MST state
    mstWeight?: number;
    currentEdge?: { source: string; target: string; weight: number };
    edgeList?: Array<{ source: string; target: string; weight: number; status: 'pending' | 'accepted' | 'rejected' }>;
    // A* pathfinding state
    targetNode?: string;
    fScores?: Record<string, number>;
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

export type DPStep = {
  /** DP table snapshot; null = not yet computed */
  table: (number | null)[][];
  /** Label for each row (rendered left of the grid) */
  rowLabels: string[];
  /** Label for each column (rendered above the grid) */
  colLabels: string[];
  activeLine: number;
  highlights: {
    /** Cell(s) currently being computed [row, col] */
    current?: Array<[number, number]>;
    /** Cell(s) being read to compute the current cell */
    sources?: Array<[number, number]>;
    /** Cells on the final solution / traceback path */
    result?: Array<[number, number]>;
  };
  metadata?: {
    description?: string;
    inputA?: string;
    inputB?: string;
    inputArray?: number[];
    weights?: number[];
    values?: number[];
    capacity?: number;
    i?: number;
    j?: number;
    finalResult?: number | string;
  };
  operations: {
    cellsFilled: number;
    comparisons: number;
  };
};

export type DPAlgorithm = {
  id: string;
  name: string;
  /** size steers the randomly generated problem instance */
  generateSteps: (size: number) => DPStep[];
  code: string;
  complexity?: Complexity;
};

export type StringStep = {
  /** The string the algorithm operates on (text, or pattern+'$'+text for Z) */
  text: string;
  /** Pattern being searched, rendered aligned under the text */
  pattern?: string;
  /** Column offset at which the pattern row is aligned under the text */
  alignOffset?: number;
  /** Auxiliary array rendered under the strings (LPS table, Z-array, hashes) */
  auxTable?: {
    label: string;
    values: Array<number | string | null>;
    highlight?: number[];
  };
  activeLine: number;
  highlights: {
    /** Text indices under comparison (amber) */
    compare?: number[];
    /** Text indices matched in the current alignment / window (blue) */
    match?: number[];
    /** Text indices that are part of confirmed matches (emerald) */
    found?: number[];
    /** Mismatch position (rose) */
    mismatch?: number[];
    /** Pattern indices under comparison (amber) */
    patternCompare?: number[];
    /** Pattern indices matched so far (blue) */
    patternMatch?: number[];
  };
  metadata?: {
    description?: string;
    matchPositions?: number[];
    longestPalindrome?: string;
    i?: number;
    j?: number;
  };
  operations: {
    comparisons: number;
    matches: number;
  };
};

export type StringAlgorithm = {
  id: string;
  name: string;
  /** size steers the randomly generated text/pattern instance */
  generateSteps: (size: number) => StringStep[];
  code: string;
  complexity?: Complexity;
};

export type BoardStep = {
  /** Cell contents: queen glyph, move number, sudoku digit, or null = empty */
  board: Array<Array<string | number | null>>;
  /** Marks pre-filled givens (sudoku) so they render differently */
  fixed?: boolean[][];
  /** Visual style: alternating chess shading or 3×3-boxed sudoku grid */
  boardKind: 'chess' | 'sudoku';
  activeLine: number;
  highlights: {
    /** Cell(s) currently being tried (violet) */
    current?: Array<[number, number]>;
    /** Cells causing a conflict (rose) */
    conflict?: Array<[number, number]>;
    /** Candidate cells under consideration (amber) */
    candidates?: Array<[number, number]>;
    /** Cells on the final solution (emerald) */
    solution?: Array<[number, number]>;
  };
  metadata?: {
    description?: string;
    row?: number;
    col?: number;
    value?: number | string;
    solved?: boolean;
  };
  operations: {
    placements: number;
    backtracks: number;
  };
};

export type BoardAlgorithm = {
  id: string;
  name: string;
  /** size steers the board dimensions / puzzle difficulty */
  generateSteps: (size: number) => BoardStep[];
  code: string;
  complexity?: Complexity;
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
