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
  };
};

export type Algorithm = {
  id: string;
  name: string;
  generateSteps: (array: number[]) => Step[];
  code: string;
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
  };
};

export type GraphAlgorithm = {
  id: string;
  name: string;
  generateSteps: (graph: Graph, startNode: string) => GraphStep[];
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
