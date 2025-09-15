import { Layout } from "../../style";

export function fitPointsToCanvas(
  points: Float32Array,
  { width, height, margin = 0 }: Layout,
): void {

  const [xMin, yMin, xMax, yMax] = __findBounds(points);
  const w = Math.max(xMax - xMin, 1e-9);
  const h = Math.max(yMax - yMin, 1e-9);

  // rescale factor
  const s = Math.min(
    (width - 2 * margin) / w,
    (height - 2 * margin) / h,
  );

  for (let i = 0; i < points.length - 1; i += 2) {
    points[i] = (points[i] - xMin) * s + (width - s * w) * 0.5;
    points[i + 1] = (points[i + 1] - yMin) * s + (height - s * h) * 0.5;
  }
}

function __findBounds(points: Float32Array): [number, number, number, number] {
  let xMin = points[0];
  let yMin = points[1];
  let xMax = xMin;
  let yMax = yMin;

  for (let i = 0; i < points.length - 1; i += 2) {
    xMin = Math.min(xMin, points[i]);
    yMin = Math.min(yMin, points[i + 1]);
    xMax = Math.max(xMax, points[i]);
    yMax = Math.max(yMax, points[i + 1]);
  }

  return [xMin, yMin, xMax, yMax];
}