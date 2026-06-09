import type { BoardAlgorithm, BoardStep } from '../types';

/**
 * N-Queens C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  bool solve(int row, int n) {
 * 2:    if (row == n) return true;     // all queens placed
 * 3:    for (int col = 0; col < n; col++) {
 * 4:      if (isSafe(row, col)) {
 * 5:        queens[row] = col;          // place queen
 * 6:        if (solve(row + 1, n)) return true;
 * 7:        queens[row] = -1;           // backtrack
 * 8:      }
 * 9:    }
 * 10:   return false;
 * 11: }
 * 12: (blank)
 * 13: bool isSafe(int row, int col) {
 * 14:   for (int r = 0; r < row; r++)
 * 15:     if (queens[r] == col ||
 * 16:         abs(queens[r] - col) == row - r) return false;
 * 17:   return true;
 * 18: }
 */
const code = `bool solve(int row, int n) {
  if (row == n) return true;     // all queens placed
  for (int col = 0; col < n; col++) {
    if (isSafe(row, col)) {
      queens[row] = col;          // place queen
      if (solve(row + 1, n)) return true;
      queens[row] = -1;           // backtrack
    }
  }
  return false;
}

bool isSafe(int row, int col) {
  for (int r = 0; r < row; r++)
    if (queens[r] == col ||
        abs(queens[r] - col) == row - r) return false;
  return true;
}`;

const QUEEN = '♛';

/**
 * Generate visualization steps for the N-Queens backtracking solver.
 *
 * Queens are placed one per row. For each row every column is tried; a
 * column is rejected if an earlier queen shares the column or a diagonal.
 * When no column works the algorithm backtracks, removing the previous
 * queen and resuming its column scan — the essence of backtracking.
 *
 * Time Complexity: O(n!)   Space Complexity: O(n)
 */
function generateSteps(size: number): BoardStep[] {
  const steps: BoardStep[] = [];
  const n = Math.max(4, Math.min(8, size));

  let placements = 0;
  let backtracks = 0;
  const queens: number[] = new Array(n).fill(-1);

  const boardSnap = (): Array<Array<string | null>> =>
    Array.from({ length: n }, (_, r) =>
      Array.from({ length: n }, (_, c) => (queens[r] === c ? QUEEN : null))
    );

  const placedCells = (): Array<[number, number]> =>
    queens.flatMap((c, r) => (c >= 0 ? [[r, c] as [number, number]] : []));

  // Returns the first attacking queen's cell, or null if safe
  const attacker = (row: number, col: number): [number, number] | null => {
    for (let r = 0; r < row; r++) {
      if (queens[r] === col || Math.abs(queens[r] - col) === row - r) {
        return [r, queens[r]];
      }
    }
    return null;
  };

  steps.push({
    board: boardSnap(),
    boardKind: 'chess',
    activeLine: 1,
    highlights: {},
    metadata: { description: `Place ${n} queens so none attack each other — one per row` },
    operations: { placements, backtracks },
  });

  const solve = (row: number): boolean => {
    if (row === n) return true;

    for (let col = 0; col < n; col++) {
      const threat = attacker(row, col);

      // Step: try this square (lines 3-4)
      steps.push({
        board: boardSnap(),
        boardKind: 'chess',
        activeLine: threat ? 16 : 4,
        highlights: {
          current: [[row, col]],
          conflict: threat ? [threat, [row, col]] : [],
        },
        metadata: {
          description: threat
            ? `(${row}, ${col}) is attacked by the queen at (${threat[0]}, ${threat[1]})`
            : `(${row}, ${col}) is safe — place a queen`,
          row,
          col,
        },
        operations: { placements, backtracks },
      });

      if (!threat) {
        queens[row] = col;
        placements++;

        // Step: queen placed (line 5)
        steps.push({
          board: boardSnap(),
          boardKind: 'chess',
          activeLine: 5,
          highlights: { current: [[row, col]] },
          metadata: { description: `Queen ${row + 1} placed at (${row}, ${col}) — move to row ${row + 1}`, row, col },
          operations: { placements, backtracks },
        });

        if (solve(row + 1)) return true;

        // Step: backtrack (line 7)
        queens[row] = -1;
        backtracks++;
        steps.push({
          board: boardSnap(),
          boardKind: 'chess',
          activeLine: 7,
          highlights: { conflict: [[row, col]] },
          metadata: { description: `Dead end below — remove the queen from (${row}, ${col}) and keep scanning row ${row}`, row, col },
          operations: { placements, backtracks },
        });
      }
    }

    return false;
  };

  const solved = solve(0);

  // Final step (line 2)
  steps.push({
    board: boardSnap(),
    boardKind: 'chess',
    activeLine: 2,
    highlights: { solution: solved ? placedCells() : [] },
    metadata: {
      description: solved
        ? `Solved! All ${n} queens placed with ${backtracks} backtrack${backtracks === 1 ? '' : 's'}`
        : 'No solution exists',
      solved,
    },
    operations: { placements, backtracks },
  });

  return steps;
}

export const nQueens: BoardAlgorithm = {
  id: 'queens',
  name: 'N-Queens',
  generateSteps,
  code,
  complexity: {
    best: 'O(n)',
    average: 'O(n!)',
    worst: 'O(n!)',
    space: 'O(n)',
  },
};
