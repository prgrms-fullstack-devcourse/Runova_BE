import { CanvasRenderingContext2D } from "skia-canvas";
import { BgStarDTO } from "../../dto";
import { BgStarStyle, Layout } from "../../style";

export function drawBgStars(
  ctx: CanvasRenderingContext2D,
  { width, height }: Layout,
  { color, density, minRadius, maxRadius, minAlpha, maxAlpha }: BgStarStyle,
): void {
  const nStars = Math.floor((width * height) / density);

  Array.from({ length: nStars })
    .map((): BgStarDTO => ({
      color,
      cx: __generateRandNum(0, width),
      cy: __generateRandNum(0, height),
      radius: __generateRandNum(minRadius, maxRadius),
      alpha: __generateRandNum(minAlpha, maxAlpha),
    }))
    .forEach(star => __renderBgStar(ctx, star));

  ctx.globalAlpha = 1;
}

function __renderBgStar(
  ctx: CanvasRenderingContext2D,
  { cx, cy, radius, alpha, color }: BgStarDTO,
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(cx, cy, radius, radius);
}

function __generateRandNum(lower: number, upper: number): number {
  return lower + Math.random() * (upper - lower);
}