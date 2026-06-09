import type { DPAlgorithm } from '../types';
import { dpLCS } from './dpLCS';
import { dpKnapsack } from './dpKnapsack';
import { dpLIS } from './dpLIS';
import { dpFibonacci } from './dpFibonacci';

export const dpAlgorithmRegistry: Record<string, DPAlgorithm> = {
  lcs: dpLCS,
  knapsack: dpKnapsack,
  lis: dpLIS,
  fib: dpFibonacci,
};

export function getDPAlgorithm(id: string): DPAlgorithm | undefined {
  return dpAlgorithmRegistry[id];
}

export function getDPAlgorithmOptions(): Array<{ id: string; name: string }> {
  return Object.values(dpAlgorithmRegistry).map(a => ({ id: a.id, name: a.name }));
}

export function getDefaultDPAlgorithm(): string {
  return 'lcs';
}
