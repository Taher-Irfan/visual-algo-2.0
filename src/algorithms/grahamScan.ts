import type { GeometryAlgorithm, GeometryStep, GeoPoint } from '../types';

/**
 * Graham Scan C++ Code
 *
 * Line mapping (1-indexed) used for activeLine highlights:
 * 1:  vector<Point> grahamScan(vector<Point> pts) {
 * 2:    pivot = lowest point (min y, then min x)
 * 3:    sort others by polar angle around pivot
 * 4:    stack = [pivot, pts[1]]
 * 5:    for (int i = 2; i < n; i++) {
 * 6:      while (stack.size() > 1 &&
 * 7:             cross(below-top, top, pts[i]) <= 0)
 * 8:        stack.pop();        // right turn — discard top
 * 9:      stack.push(pts[i]);
 * 10:   }
 * 11:   return stack;           // hull in CCW order
 * 12: }
 */
const code = `vector<Point> grahamScan(vector<Point> pts) {
  pivot = lowest point (min y, then min x)
  sort others by polar angle around pivot
  stack = [pivot, pts[1]]
  for (int i = 2; i < n; i++) {
    while (stack.size() > 1 &&
           cross(below-top, top, pts[i]) <= 0)
      stack.pop();        // right turn — discard top
    stack.push(pts[i]);
  }
  return stack;           // hull in CCW order
}`;

export function randomPoints(count: number): GeoPoint[] {
  // Floats make exactly-collinear triples a measure-zero event
  return Array.from({ length: count }, () => ({
    x: 8 + Math.random() * 84,
    y: 8 + Math.random() * 84,
  }));
}

/**
 * Cross product of (a→b) × (a→c) with the y-axis flipped so that positive
 * means a visually counter-clockwise (left) turn in SVG screen coordinates.
 */
export function cross(a: GeoPoint, b: GeoPoint, c: GeoPoint): number {
  return (b.x - a.x) * -(c.y - a.y) - -(b.y - a.y) * (c.x - a.x);
}

/**
 * Generate visualization steps for the Graham Scan convex hull algorithm.
 *
 * The points are sorted by polar angle around the visually lowest point;
 * a stack then sweeps through them, popping any point that would create a
 * clockwise (right) turn. Each point is pushed once and popped at most once,
 * so the scan after sorting is linear.
 *
 * Time Complexity: O(n log n)   Space Complexity: O(n)
 */
function generateSteps(size: number): GeometryStep[] {
  const steps: GeometryStep[] = [];
  const count = Math.max(10, Math.min(28, size * 2 + 4));
  const points = randomPoints(count);

  let comparisons = 0;

  // Pivot: visually lowest (max screen y), ties by min x
  let pivot = 0;
  for (let i = 1; i < count; i++) {
    if (points[i].y > points[pivot].y || (points[i].y === points[pivot].y && points[i].x < points[pivot].x)) {
      pivot = i;
    }
  }

  steps.push({
    points,
    hull: [],
    activeLine: 2,
    highlights: { current: [pivot] },
    metadata: { description: 'Pivot: the lowest point — guaranteed to be on the hull', pivot },
    operations: { comparisons, hullSize: 0 },
  });

  // Sort the remaining indices by polar angle around the pivot
  const order = Array.from({ length: count }, (_, i) => i)
    .filter(i => i !== pivot)
    .sort((a, b) => {
      const angA = Math.atan2(-(points[a].y - points[pivot].y), points[a].x - points[pivot].x);
      const angB = Math.atan2(-(points[b].y - points[pivot].y), points[b].x - points[pivot].x);
      return angA - angB;
    });
  const sorted = [pivot, ...order];

  steps.push({
    points,
    hull: [pivot],
    activeLine: 3,
    highlights: { current: [pivot], candidate: [sorted[1]] },
    metadata: { description: 'Points sorted by polar angle around the pivot — sweep counter-clockwise', pivot },
    operations: { comparisons, hullSize: 1 },
  });

  const stack: number[] = [sorted[0], sorted[1]];

  steps.push({
    points,
    hull: [...stack],
    activeLine: 4,
    highlights: { current: [sorted[1]] },
    metadata: { description: 'Start the hull chain with the pivot and the first sorted point', pivot },
    operations: { comparisons, hullSize: stack.length },
  });

  for (let i = 2; i < sorted.length; i++) {
    const p = sorted[i];

    // Pop while the new point makes the chain turn clockwise
    for (;;) {
      if (stack.length < 2) break;
      comparisons++;
      const turn = cross(points[stack[stack.length - 2]], points[stack[stack.length - 1]], points[p]);
      const leftTurn = turn > 0;

      steps.push({
        points,
        hull: [...stack],
        activeLine: leftTurn ? 6 : 7,
        highlights: {
          current: [p],
          candidate: [stack[stack.length - 1], stack[stack.length - 2]],
        },
        metadata: {
          description: leftTurn
            ? `Left turn through point ${stack[stack.length - 1]} — the chain stays convex`
            : `Right turn through point ${stack[stack.length - 1]} — pop it off the hull`,
          pivot,
        },
        operations: { comparisons, hullSize: stack.length },
      });

      if (leftTurn) break;

      const popped = stack.pop()!;
      steps.push({
        points,
        hull: [...stack],
        activeLine: 8,
        highlights: { current: [p], rejected: [popped] },
        metadata: { description: `Point ${popped} removed — it would sit inside the hull`, pivot },
        operations: { comparisons, hullSize: stack.length },
      });
    }

    stack.push(p);
    steps.push({
      points,
      hull: [...stack],
      activeLine: 9,
      highlights: { current: [p] },
      metadata: { description: `Point ${p} pushed onto the hull chain`, pivot },
      operations: { comparisons, hullSize: stack.length },
    });
  }

  // Final step: close the polygon
  steps.push({
    points,
    hull: [...stack],
    closed: true,
    activeLine: 11,
    highlights: {},
    metadata: { description: `Convex hull complete — ${stack.length} of ${count} points`, pivot },
    operations: { comparisons, hullSize: stack.length },
  });

  return steps;
}

export const grahamScan: GeometryAlgorithm = {
  id: 'graham',
  name: 'Graham Scan',
  generateSteps,
  code,
  complexity: {
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n log n)',
    space: 'O(n)',
  },
};
