import { CanvasRenderingContext2D } from "skia-canvas";
import { LineStyle } from "../style";
import { XY } from "../type";

export function drawLine(
  ctx: CanvasRenderingContext2D,
  points: XY[],
  { alpha, width, glowAlpha, glowBlur }: LineStyle
): void {
  ctx.save();

  ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
  ctx.lineWidth = width;
  ctx.shadowColor = `rgba(255,255,255,${glowAlpha})`;
  ctx.shadowBlur = glowBlur;

  for (let i = 0; i < points.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i + 1].y);
    ctx.lineTo(points[i + 1].x, points[i + 1].y);
    ctx.stroke();
  }

  ctx.restore();
}

function __strokeLine(
  ctx: CanvasRenderingContext2D,
  points: Float32Array,
  width: number,
  color: string,
): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.globalCompositeOperation = "source-over";
  __renderLine(ctx, points);
}

function __addGlowEffect(
  ctx: CanvasRenderingContext2D,
  points: Float32Array,
  { baseColor, width, layers }: GlowStyle,
): void {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalCompositeOperation = "lighter";

  for (const { blur, alpha } of layers) {
    ctx.shadowBlur = blur;
    ctx.shadowColor = baseColor;
    ctx.strokeStyle = baseColor;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width + blur * 0.12;
    __renderLine(ctx, points);
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function __renderLine(
  ctx: CanvasRenderingContext2D,
  points: Float32Array,
): void {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);

  for (let i = 2; i < points.length - 1; i += 2)
    ctx.lineTo(points[i], points[i + 1]);

  ctx.stroke();
}