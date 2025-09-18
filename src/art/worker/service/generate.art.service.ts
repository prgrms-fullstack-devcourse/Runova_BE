import { Inject, Injectable } from "@nestjs/common";
import { Layout } from "../style";
import { convertPointsToUTMK, drawBgStars, drawLine, fitPointsToCanvas } from "./internal";
import { Canvas, CanvasRenderingContext2D } from "skia-canvas";
import { ConstellationStyleService } from "./constellation.style.service";

@Injectable()
export class GenerateArtService {

  constructor(
    @Inject(ConstellationStyleService)
    private readonly styleService: ConstellationStyleService,
  ) {}

  async generate(points: Float32Array): Promise<Uint8Array> {
    const { layout, bgColor, bgStarStyle, lineStyle } = this.styleService.get();

    const canvas = new Canvas(layout.width, layout.height);
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, layout.width, layout.height);
    drawBgStars(ctx, layout, bgStarStyle);
    drawLine(ctx, __normalizePoints(points, layout), lineStyle);

    const buf: Buffer = await canvas.toBuffer("svg");
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
}

function __normalizePoints(
  points: Float32Array,
  layout: Layout,
): Float32Array {
  convertPointsToUTMK(points)
  fitPointsToCanvas(points, layout)
  return points;
}



