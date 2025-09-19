import { Inject, Injectable, Logger } from "@nestjs/common";
import { drawLine, drawStar, fitPointsToCanvas } from "./internal";
import { Canvas, CanvasRenderingContext2D } from "skia-canvas";
import { ArtOptions } from "../art.options";
import { ArtStyle } from "../style";

@Injectable()
export class GenerateArtService {
  private readonly format: "png" | "svg";
  private readonly style: ArtStyle;

  constructor(
      @Inject(ArtOptions)
      options: ArtOptions,
  ) {
    Logger.debug(options, GenerateArtService.name);
    this.format = options.format;
    this.style = options.style;
  }

  async generate(points: Float32Array): Promise<Uint8Array> {
    const { layout, lineStyle, starStyle } = this.style;

    const canvas = new Canvas(layout.width, layout.height);
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d");

    fitPointsToCanvas(points, layout);
    drawLine(ctx, points, lineStyle);

    for (let i = 0; i < points.length - 1; i += 2)
      drawStar(ctx, points[i], points[i + 1], starStyle);

    const buf: Buffer = await canvas.toBuffer(this.format);
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
}
