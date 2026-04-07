import type { SegmentTreeAlgorithm } from '../types';
import { segmentTree } from './segmentTree';

export const segmentTreeRegistry: Record<string, SegmentTreeAlgorithm> = {
  segment: segmentTree,
};

export function getSegmentTreeAlgorithm(id: string): SegmentTreeAlgorithm | undefined {
  return segmentTreeRegistry[id];
}

export function getSegmentTreeAlgorithmOptions(): Array<{ id: string; name: string }> {
  return Object.values(segmentTreeRegistry).map(a => ({ id: a.id, name: a.name }));
}

export function getDefaultSegmentTreeAlgorithm(): string {
  return 'segment';
}
