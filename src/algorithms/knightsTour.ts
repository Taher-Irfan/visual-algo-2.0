import type { BoardAlgorithm, BoardStep } from '../types';

/**
 * Knight's Tour (Warnsdorff + backtracking) C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  bool tour(int r, int c, int move) {
 * 2:    board[r][c] = move;
 * 3:    if (move == N * N) return true;   // every square visited
 * 4:    // order moves by Warnsdorff's rule:
 * 5:    // fewest onward moves first
 * 6:    for ((nr, nc) in orderedMoves(r, c)) {
 * 7:      if (board[nr][nc] == 0)
 * 8:        if (tour(nr, nc, move + 1)) return true;
 * 9:    }
 * 10:   board[r][c] = 0;                  // backtrack
 * 11:   return false;
 * 12: }
 */
const code = `bool tour(int r, int c, int move) {
  board[r][c] = move;
  if (move == N * N) return true;   // every square visited
  // order moves by Warnsdorff's rule:
  // fewest onward moves first
  for ((nr, nc) in orderedMoves(r, c)) {
    if (board[nr][nc] == 0)
      if (tour(nr, nc, move + 1)) return true;
  }
  board[r][c] = 0;                  // backtrack
  return false;
}`;

const MOVES: Array<[number, number]> = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

/**
 * Generate visualization steps for the Knight's Tour.
 *
 * The knight must visit every square of the board exactly once. Plain
 * backtracking is hopeless (8^(n²) worst case), but Warnsdorff's heuristic —
 * always jump to the square with the fewest onward moves — almost always
 * walks straight to a solution. Backtracking remains as a safety net, so
 * the visualization shows both the heuristic and the occasional retreat.
 *
 * Time Complexity: ~O(n²) with Warnsdorff's rule (O(8^(n²)) unaided)
 * Space Complexity: O(n²)
 */
function generateSteps(size: number): BoardStep[] {
  const steps: BoardStep[] = [];
  const n = Math.max(5, Math.min(7, size));

  let placements = 0;
  let backtracks = 0;
  const board: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  const inside = (r: number, c: number) => r >= 0 && r < n && c >= 0 && c < n;
  const free = (r: number, c: number) => inside(r, c) && board[r][c] === 0;
  const degree = (r: number, c: number) =>
    MOVES.filter(([dr, dc]) => free(r + dr, c + dc)).length;

  const boardSnap = (): Array<Array<number | null>> =>
    board.map(row => row.map(v => (v === 0 ? null : v)));

  const visitedCells = (): Array<[number, number]> => {
    const cells: Array<[number, number]> = [];
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (board[r][c] !== 0) cells.push([r, c]);
    return cells;
  };

  steps.push({
    board: boardSnap(),
    boardKind: 'chess',
    activeLine: 1,
    highlights: { current: [[0, 0]] },
    metadata: { description: `Visit all ${n * n} squares exactly once with knight moves, starting at (0, 0)` },
    operations: { placements, backtracks },
  });

  const tour = (r: number, c: number, move: number): boolean => {
    board[r][c] = move;
    placements++;

    // Step: knight lands here (line 2)
    steps.push({
      board: boardSnap(),
      boardKind: 'chess',
      activeLine: 2,
      highlights: { current: [[r, c]] },
      metadata: { description: `Move ${move}: knight lands on (${r}, ${c})`, row: r, col: c, value: move },
      operations: { placements, backtracks },
    });

    if (move === n * n) return true;

    // Warnsdorff: candidates ordered by fewest onward moves (lines 4-6)
    const candidates = MOVES
      .map(([dr, dc]) => [r + dr, c + dc] as [number, number])
      .filter(([nr, nc]) => free(nr, nc))
      .sort((a, b) => degree(a[0], a[1]) - degree(b[0], b[1]));

    if (candidates.length > 0) {
      steps.push({
        board: boardSnap(),
        boardKind: 'chess',
        activeLine: 6,
        highlights: { current: [[r, c]], candidates },
        metadata: {
          description: `${candidates.length} onward square${candidates.length === 1 ? '' : 's'} — Warnsdorff picks (${candidates[0][0]}, ${candidates[0][1]}) with the fewest exits`,
          row: r,
          col: c,
        },
        operations: { placements, backtracks },
      });
    }

    for (const [nr, nc] of candidates) {
      if (tour(nr, nc, move + 1)) return true;
    }

    // Step: dead end — retreat (line 10)
    board[r][c] = 0;
    backtracks++;
    steps.push({
      board: boardSnap(),
      boardKind: 'chess',
      activeLine: 10,
      highlights: { conflict: [[r, c]] },
      metadata: { description: `Dead end at (${r}, ${c}) — undo move ${move} and backtrack`, row: r, col: c },
      operations: { placements, backtracks },
    });
    return false;
  };

  const solved = tour(0, 0, 1);

  // Final step (line 3)
  steps.push({
    board: boardSnap(),
    boardKind: 'chess',
    activeLine: 3,
    highlights: { solution: solved ? visitedCells() : [] },
    metadata: {
      description: solved
        ? `Tour complete! All ${n * n} squares visited (${backtracks} backtrack${backtracks === 1 ? '' : 's'})`
        : 'No tour found from this start',
      solved,
    },
    operations: { placements, backtracks },
  });

  return steps;
}

export const knightsTour: BoardAlgorithm = {
  id: 'knight',
  name: "Knight's Tour",
  generateSteps,
  code,
  complexity: {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(8^(n²))',
    space: 'O(n²)',
  },
};
