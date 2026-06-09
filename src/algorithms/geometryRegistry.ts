import type { GeometryAlgorithm } from '../types';
import { grahamScan } from './grahamScan';
import { jarvisMarch } from './jarvisMarch';

export const geometryAlgorithmRegistry: Record<string, GeometryAlgorithm> = {
  graham: grahamScan,
  jarvis: jarvisMarch,
};

export function getGeometryAlgorithm(id: string): GeometryAlgorithm | undefined {
  return geometryAlgorithmRegistry[id];
}

export function getGeometryAlgorithmOptions(): Array<{ id: string; name: string }> {
  return Object.values(geometryAlgorithmRegistry).map(a => ({ id: a.id, name: a.name }));
}

export function getDefaultGeometryAlgorithm(): string {
  return 'graham';
}
