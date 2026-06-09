import type { GeometryAlgorithm, GeometryStep } from '../types';
import { randomPoints, cross } from './grahamScan';

/**
 * Jarvis March (Gift Wrapping) C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  vector<Point> jarvisMarch(vector<Point> pts) {
 * 2:    start = leftmost point
 * 3:    current = start
 * 4:    do {
 * 5:      hull.push(current)
 * 6:      next = any point != current
 * 7:      for (Point p : pts)
 * 8:        if (cross(current, next, p) < 0)
 * 9:          next = p;     // p is more clockwise
 * 10:     current = next
 * 11:   } while (current != start);
 * 12:   return hull;
 * 13: }
 */
const code = `vector<Point> jarvisMarch(vector<Point> pts) {
  start = leftmost point
  current = start
  do {
    hull.push(current)
    next = any point != current
    for (Point p : pts)
      if (cross(current, next, p) < 0)
        next = p;     // p is more clockwise
    current = next
  } while (current != start);
  return hull;
}`;

/**
 * Generate visualization steps for the Jarvis March (gift wrapping) convex
 * hull algorithm.
 *
 * Starting from the leftmost point, each round scans every point to find the
 * one that is "most clockwise" relative to the current hull point — like
 * wrapping a string around the point set. The loop ends when the wrap
 * returns to the start. Output-sensitive: O(n·h) for h hull points.
 *
 * Time Complexity: O(n·h)   Space Complexity: O(n)
 */
function generateSteps(size: number): GeometryStep[] {
  const steps: GeometryStep[] = [];
  const count = Math.max(10, Math.min(28, size * 2 + 4));
  const points = randomPoints(count);

  let comparisons = 0;

  // Start at the leftmost point (min x), ties by min screen y
  let start = 0;
  for (let i = 1; i < count; i++) {
    if (points[i].x < points[start].x || (points[i].x === points[start].x && points[i].y < points[start].y)) {
      start = i;
    }
  }

  steps.push({
    points,
    hull: [],
    activeLine: 2,
    highlights: { current: [start] },
    metadata: { description: 'Start at the leftmost point — guaranteed to be on the hull', pivot: start },
    operations: { comparisons, hullSize: 0 },
  });

  const hull: number[] = [];
  let current = start;

  do {
    hull.push(current);

    steps.push({
      points,
      hull: [...hull],
      activeLine: 5,
      highlights: { current: [current] },
      metadata: { description: `Point ${current} locked onto the hull — scan for the next wrap point`, pivot: start },
      operations: { comparisons, hullSize: hull.length },
    });

    let next = (current + 1) % count;

    for (let p = 0; p < count; p++) {
      if (p === current || p === next) continue;
      comparisons++;
      const turn = cross(points[current], points[next], points[p]);
      const better = turn < 0;

      steps.push({
        points,
        hull: [...hull],
        activeLine: better ? 9 : 8,
        highlights: { current: [current], candidate: [next], rejected: better ? [] : [p] },
        metadata: {
          description: better
            ? `Point ${p} is more clockwise than ${next} — it becomes the new candidate`
            : `Point ${p} is inside the wrap of candidate ${next} — keep ${next}`,
          pivot: start,
        },
        operations: { comparisons, hullSize: hull.length },
      });

      if (better) next = p;
    }

    steps.push({
      points,
      hull: [...hull],
      activeLine: 10,
      highlights: { current: [current], candidate: [next] },
      metadata: { description: `Wrap to point ${next}${next === start ? ' — back at the start!' : ''}`, pivot: start },
      operations: { comparisons, hullSize: hull.length },
    });

    current = next;
  } while (current !== start);

  // Final step: close the polygon
  steps.push({
    points,
    hull: [...hull],
    closed: true,
    activeLine: 12,
    highlights: {},
    metadata: { description: `Convex hull complete — ${hull.length} of ${count} points`, pivot: start },
    operations: { comparisons, hullSize: hull.length },
  });

  return steps;
}

export const jarvisMarch: GeometryAlgorithm = {
  id: 'jarvis',
  name: 'Jarvis March',
  generateSteps,
  code,
  complexity: {
    best: 'O(n·h)',
    average: 'O(n·h)',
    worst: 'O(n²)',
    space: 'O(n)',
  },
};
