import type { StringAlgorithm } from '../types';
import { kmp } from './kmp';
import { rabinKarp } from './rabinKarp';
import { zAlgorithm } from './zAlgorithm';
import { palindrome } from './palindrome';
import { boyerMoore } from './boyerMoore';

export const stringAlgorithmRegistry: Record<string, StringAlgorithm> = {
  kmp,
  rabinkarp: rabinKarp,
  boyermoore: boyerMoore,
  z: zAlgorithm,
  palindrome,
};

export function getStringAlgorithm(id: string): StringAlgorithm | undefined {
  return stringAlgorithmRegistry[id];
}

export function getStringAlgorithmOptions(): Array<{ id: string; name: string }> {
  return Object.values(stringAlgorithmRegistry).map(a => ({ id: a.id, name: a.name }));
}

export function getDefaultStringAlgorithm(): string {
  return 'kmp';
}
