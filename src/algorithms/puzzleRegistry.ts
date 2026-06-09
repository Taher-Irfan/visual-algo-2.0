import type { BoardAlgorithm } from '../types';
import { nQueens } from './nQueens';
import { sudoku } from './sudoku';
import { knightsTour } from './knightsTour';

export const puzzleAlgorithmRegistry: Record<string, BoardAlgorithm> = {
  queens: nQueens,
  sudoku,
  knight: knightsTour,
};

export function getPuzzleAlgorithm(id: string): BoardAlgorithm | undefined {
  return puzzleAlgorithmRegistry[id];
}

export function getPuzzleAlgorithmOptions(): Array<{ id: string; name: string }> {
  return Object.values(puzzleAlgorithmRegistry).map(a => ({ id: a.id, name: a.name }));
}

export function getDefaultPuzzleAlgorithm(): string {
  return 'queens';
}
