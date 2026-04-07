import type { SegmentTreeAlgorithm, SegmentTreeNode, SegmentTreeStep } from '../types';

// Line mapping:
// 1:  void build(int node, int l, int r) {
// 2:    if (l == r) { tree[node] = arr[l]; return; }
// 3:    int mid = (l + r) / 2;
// 4:    build(2*node, l, mid);
// 5:    build(2*node+1, mid+1, r);
// 6:    tree[node] = tree[2*node] + tree[2*node+1];
// 7:  }
// 8:  (blank)
// 9:  int query(int node, int l, int r, int ql, int qr) {
// 10:   if (qr < l || r < ql) return 0;
// 11:   if (ql <= l && r <= qr) return tree[node];
// 12:   int mid = (l + r) / 2;
// 13:   return query(2*node, l, mid, ql, qr)
// 14:        + query(2*node+1, mid+1, r, ql, qr);
// 15: }
// 16: (blank)
// 17: void update(int node, int l, int r, int idx, int val) {
// 18:   if (l == r) { tree[node] = val; return; }
// 19:   int mid = (l + r) / 2;
// 20:   if (idx <= mid) update(2*node, l, mid, idx, val);
// 21:   else update(2*node+1, mid+1, r, idx, val);
// 22:   tree[node] = tree[2*node] + tree[2*node+1];
// 23: }

const code = `void build(int node, int l, int r) {
  if (l == r) { tree[node] = arr[l]; return; }
  int mid = (l + r) / 2;
  build(2*node, l, mid);
  build(2*node+1, mid+1, r);
  tree[node] = tree[2*node] + tree[2*node+1];
}

int query(int node, int l, int r, int ql, int qr) {
  if (qr < l || r < ql) return 0;
  if (ql <= l && r <= qr) return tree[node];
  int mid = (l + r) / 2;
  return query(2*node, l, mid, ql, qr)
       + query(2*node+1, mid+1, r, ql, qr);
}

void update(int node, int l, int r, int idx, int val) {
  if (l == r) { tree[node] = val; return; }
  int mid = (l + r) / 2;
  if (idx <= mid) update(2*node, l, mid, idx, val);
  else update(2*node+1, mid+1, r, idx, val);
  tree[node] = tree[2*node] + tree[2*node+1];
}`;

function generateSteps(array: number[]): SegmentTreeStep[] {
  const steps: SegmentTreeStep[] = [];
  const n = array.length;
  const tree = new Array(4 * n).fill(0);
  const arr = [...array];

  // Pre-compute all node ranges via DFS so snapshot() knows every node
  const nodeRanges = new Map<number, { left: number; right: number }>();
  function precompute(idx: number, l: number, r: number) {
    nodeRanges.set(idx, { left: l, right: r });
    if (l === r) return;
    const mid = Math.floor((l + r) / 2);
    precompute(2 * idx, l, mid);
    precompute(2 * idx + 1, mid + 1, r);
  }
  precompute(1, 0, n - 1);

  const computedSet = new Set<number>();
  let comparisons = 0;
  let accesses = 0;

  function snapshot(): SegmentTreeNode[] {
    const nodes: SegmentTreeNode[] = [];
    nodeRanges.forEach(({ left, right }, nodeIdx) => {
      nodes.push({ nodeIdx, left, right, value: tree[nodeIdx] });
    });
    return nodes;
  }

  // ── BUILD PHASE ─────────────────────────────────────────────────────────────

  steps.push({
    nodes: snapshot(),
    sourceArray: [...arr],
    activeLine: 1,
    phase: 'build',
    highlights: {},
    operations: { comparisons, accesses },
    metadata: { description: 'Start building the segment tree' },
  });

  function buildStep(nodeIdx: number, l: number, r: number) {
    if (l === r) {
      // Leaf node
      tree[nodeIdx] = arr[l];
      accesses++;
      computedSet.add(nodeIdx);
      steps.push({
        nodes: snapshot(),
        sourceArray: [...arr],
        activeLine: 2,
        phase: 'build',
        highlights: { active: [nodeIdx], computed: [...computedSet] },
        operations: { comparisons, accesses },
        metadata: { description: `Leaf [${l}] = ${arr[l]}` },
      });
      return;
    }

    const mid = Math.floor((l + r) / 2);

    // Show entering this internal node
    steps.push({
      nodes: snapshot(),
      sourceArray: [...arr],
      activeLine: 3,
      phase: 'build',
      highlights: { active: [nodeIdx], computed: [...computedSet] },
      operations: { comparisons, accesses },
      metadata: { description: `Node [${l},${r}]: mid = ${mid}` },
    });

    // Recurse left child
    steps.push({
      nodes: snapshot(),
      sourceArray: [...arr],
      activeLine: 4,
      phase: 'build',
      highlights: { active: [2 * nodeIdx], computed: [...computedSet] },
      operations: { comparisons, accesses },
      metadata: { description: `Build left child [${l},${mid}]` },
    });
    buildStep(2 * nodeIdx, l, mid);

    // Recurse right child
    steps.push({
      nodes: snapshot(),
      sourceArray: [...arr],
      activeLine: 5,
      phase: 'build',
      highlights: { active: [2 * nodeIdx + 1], computed: [...computedSet] },
      operations: { comparisons, accesses },
      metadata: { description: `Build right child [${mid + 1},${r}]` },
    });
    buildStep(2 * nodeIdx + 1, mid + 1, r);

    // Combine children
    accesses += 2;
    tree[nodeIdx] = tree[2 * nodeIdx] + tree[2 * nodeIdx + 1];
    computedSet.add(nodeIdx);
    steps.push({
      nodes: snapshot(),
      sourceArray: [...arr],
      activeLine: 6,
      phase: 'build',
      highlights: { active: [nodeIdx], computed: [...computedSet] },
      operations: { comparisons, accesses },
      metadata: { description: `Node [${l},${r}] = ${tree[nodeIdx]}` },
    });
  }

  buildStep(1, 0, n - 1);

  steps.push({
    nodes: snapshot(),
    sourceArray: [...arr],
    activeLine: 7,
    phase: 'build',
    highlights: { computed: [...computedSet] },
    operations: { comparisons, accesses },
    metadata: { description: 'Tree built. Total sum = ' + tree[1] },
  });

  // ── QUERY PHASE ─────────────────────────────────────────────────────────────
  // Query range: [0, floor(n/2) - 1] — first half of the array

  const ql = 0;
  const qr = Math.floor(n / 2) - 1;
  const outOfRangeNodes: number[] = [];
  const inRangeNodes: number[] = [];
  const partialNodes: number[] = [];

  steps.push({
    nodes: snapshot(),
    sourceArray: [...arr],
    activeLine: 9,
    phase: 'query',
    highlights: { computed: [...computedSet] },
    operations: { comparisons, accesses },
    metadata: { queryRange: [ql, qr], description: `Query sum of arr[${ql}..${qr}]` },
  });

  function queryStep(nodeIdx: number, l: number, r: number): number {
    comparisons++;

    if (qr < l || r < ql) {
      outOfRangeNodes.push(nodeIdx);
      steps.push({
        nodes: snapshot(),
        sourceArray: [...arr],
        activeLine: 10,
        phase: 'query',
        highlights: {
          computed: [...computedSet],
          outOfRange: [...outOfRangeNodes],
          inRange: [...inRangeNodes],
          path: [...partialNodes],
          active: [nodeIdx],
        },
        operations: { comparisons, accesses },
        metadata: { queryRange: [ql, qr], description: `[${l},${r}] out of range → 0` },
      });
      return 0;
    }

    if (ql <= l && r <= qr) {
      inRangeNodes.push(nodeIdx);
      accesses++;
      const val = tree[nodeIdx];
      steps.push({
        nodes: snapshot(),
        sourceArray: [...arr],
        activeLine: 11,
        phase: 'query',
        highlights: {
          computed: [...computedSet],
          outOfRange: [...outOfRangeNodes],
          inRange: [...inRangeNodes],
          path: [...partialNodes],
          active: [nodeIdx],
        },
        operations: { comparisons, accesses },
        metadata: { queryRange: [ql, qr], description: `[${l},${r}] fully in range → ${val}` },
      });
      return val;
    }

    // Partial overlap
    partialNodes.push(nodeIdx);
    const mid = Math.floor((l + r) / 2);
    steps.push({
      nodes: snapshot(),
      sourceArray: [...arr],
      activeLine: 12,
      phase: 'query',
      highlights: {
        computed: [...computedSet],
        outOfRange: [...outOfRangeNodes],
        inRange: [...inRangeNodes],
        path: [...partialNodes],
        active: [nodeIdx],
      },
      operations: { comparisons, accesses },
      metadata: { queryRange: [ql, qr], description: `[${l},${r}] partial → recurse, mid=${mid}` },
    });

    const leftVal = queryStep(2 * nodeIdx, l, mid);
    const rightVal = queryStep(2 * nodeIdx + 1, mid + 1, r);
    return leftVal + rightVal;
  }

  const queryResult = queryStep(1, 0, n - 1);

  steps.push({
    nodes: snapshot(),
    sourceArray: [...arr],
    activeLine: 15,
    phase: 'query',
    highlights: {
      computed: [...computedSet],
      outOfRange: [...outOfRangeNodes],
      inRange: [...inRangeNodes],
      path: [...partialNodes],
    },
    operations: { comparisons, accesses },
    metadata: { queryRange: [ql, qr], queryResult, description: `Result = ${queryResult}` },
  });

  // ── UPDATE PHASE ─────────────────────────────────────────────────────────────
  // Update index: floor(3n/4) so it's in the right half (not in query range above)

  const updateIdx = Math.min(Math.floor((3 * n) / 4), n - 1);
  const updateVal = arr[updateIdx] > 50 ? 5 : 95;
  arr[updateIdx] = updateVal;

  const updatePath: number[] = [];

  steps.push({
    nodes: snapshot(),
    sourceArray: [...arr],
    activeLine: 17,
    phase: 'update',
    highlights: { computed: [...computedSet] },
    operations: { comparisons, accesses },
    metadata: {
      updateIndex: updateIdx,
      updateValue: updateVal,
      description: `Update arr[${updateIdx}] = ${updateVal}`,
    },
  });

  function updateStep(nodeIdx: number, l: number, r: number) {
    comparisons++;
    updatePath.push(nodeIdx);

    if (l === r) {
      tree[nodeIdx] = updateVal;
      accesses++;
      steps.push({
        nodes: snapshot(),
        sourceArray: [...arr],
        activeLine: 18,
        phase: 'update',
        highlights: { computed: [...computedSet], path: [...updatePath], active: [nodeIdx] },
        operations: { comparisons, accesses },
        metadata: {
          updateIndex: updateIdx,
          updateValue: updateVal,
          description: `Leaf [${l}] updated to ${updateVal}`,
        },
      });
      return;
    }

    const mid = Math.floor((l + r) / 2);

    if (updateIdx <= mid) {
      steps.push({
        nodes: snapshot(),
        sourceArray: [...arr],
        activeLine: 20,
        phase: 'update',
        highlights: { computed: [...computedSet], path: [...updatePath], active: [2 * nodeIdx] },
        operations: { comparisons, accesses },
        metadata: {
          updateIndex: updateIdx,
          updateValue: updateVal,
          description: `[${l},${r}]: idx≤mid, go left`,
        },
      });
      updateStep(2 * nodeIdx, l, mid);
    } else {
      steps.push({
        nodes: snapshot(),
        sourceArray: [...arr],
        activeLine: 21,
        phase: 'update',
        highlights: { computed: [...computedSet], path: [...updatePath], active: [2 * nodeIdx + 1] },
        operations: { comparisons, accesses },
        metadata: {
          updateIndex: updateIdx,
          updateValue: updateVal,
          description: `[${l},${r}]: idx>mid, go right`,
        },
      });
      updateStep(2 * nodeIdx + 1, mid + 1, r);
    }

    // Propagate sum upward
    accesses += 2;
    tree[nodeIdx] = tree[2 * nodeIdx] + tree[2 * nodeIdx + 1];
    steps.push({
      nodes: snapshot(),
      sourceArray: [...arr],
      activeLine: 22,
      phase: 'update',
      highlights: { computed: [...computedSet], path: [...updatePath], active: [nodeIdx] },
      operations: { comparisons, accesses },
      metadata: {
        updateIndex: updateIdx,
        updateValue: updateVal,
        description: `Propagate [${l},${r}] = ${tree[nodeIdx]}`,
      },
    });
  }

  updateStep(1, 0, n - 1);

  steps.push({
    nodes: snapshot(),
    sourceArray: [...arr],
    activeLine: 23,
    phase: 'update',
    highlights: { computed: [...computedSet], path: updatePath },
    operations: { comparisons, accesses },
    metadata: {
      updateIndex: updateIdx,
      updateValue: updateVal,
      description: 'Update complete',
    },
  });

  return steps;
}

export const segmentTree: SegmentTreeAlgorithm = {
  id: 'segment',
  name: 'Segment Tree',
  generateSteps,
  code,
};
