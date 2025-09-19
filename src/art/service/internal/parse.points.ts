import { XY } from "../../types";
import { BadRequestException } from "@nestjs/common";

export function parsePoints(data: Float32Array): XY[] {

    if (data.length % 2 !== 0)
        throw new BadRequestException(`data length must be even: ${data.length}`);

    const points: XY[] = [];

    for (let i = 0; i < data.length - 1; i += 2)
        points.push({ x: data[i], y: data[i + 1] });

    return points;
}