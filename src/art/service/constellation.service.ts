import { Inject, Injectable } from "@nestjs/common";
import { Layout } from "../style";
import { drawBgStars, drawLine, fitPointsToCanvas } from "./internal";
import { Canvas, CanvasRenderingContext2D } from "skia-canvas";
import { ConstellationStyleService } from "./constellation.style.service";

@Injectable()
export class ConstellationService {

  constructor(
    @Inject(ConstellationStyleService)
    private readonly styleService: ConstellationStyleService,
  ) {}

  async generateConstellation(path: Float32Array): Promise<Buffer> {
    const { layout, bgColor, bgStarStyle, lineStyle } = this.styleService.get();

    const canvas = new Canvas(layout.width, layout.height);
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, layout.width, layout.height);
    drawBgStars(ctx, layout, bgStarStyle);
    drawLine(ctx, __normalizePath(path, layout), lineStyle);

    return canvas.toBuffer("svg");
  }
}

function __normalizePath(
  path: Float32Array,
  layout: Layout,
): Float32Array {
  fitPointsToCanvas(path, layout)
  return path;
}



