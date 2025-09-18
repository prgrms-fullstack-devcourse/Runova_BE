import { Layout } from "../style";
import { XY } from "../type";

export function fitPointsToCanvas(
  points: XY[],
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

  for (const p of points) {
    p.x = (p.x - xMin) * s + (width - s * w) * 0.5;
    p.y = (p.y - yMin) * s + (height - s * h) * 0.5;
  }
}

function __findBounds(points: XY[]): [number, number, number, number] {
  let { x: xMin, y: yMin } = points[0];
  let xMax = xMin;
  let yMax = yMin;

  for (const { x, y } of points) {
    xMin = Math.min(xMin, x);
    yMin = Math.min(yMin, y);
    xMax = Math.max(xMax, x);
    yMax = Math.max(yMax, y);
  }

  return [xMin, yMin, xMax, yMax];
}