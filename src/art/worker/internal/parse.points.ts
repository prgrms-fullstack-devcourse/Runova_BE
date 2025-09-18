import { XY } from "../type";
import { BadRequestException } from "@nestjs/common";

export function parsePoints(data: Float32Array): XY[] {

    if (data.length % 2)
        throw new BadRequestException(`Invalid data length ${data.length}`);

    const points: XY[] = [];

    for (let i = 0; i < data.length - 1; i += 2)
        points.push({ x: data[i], y: data[i + 1] });

    return points;
}