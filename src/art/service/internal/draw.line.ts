import { CanvasRenderingContext2D } from "skia-canvas";
import { LineStyle } from "../../style";

export function drawLine(
  ctx: CanvasRenderingContext2D,
  points: Float32Array,
  { width, color, alpha, glow }: LineStyle
): void {
  ctx.save();

  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;

  ctx.shadowColor = glow.color;
  ctx.shadowBlur = glow.blur;

  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);

  for (let i = 2; i < points.length - 1; i += 2)
    ctx.lineTo(points[i], points[i + 1]);

  ctx.stroke();
  ctx.restore();
}