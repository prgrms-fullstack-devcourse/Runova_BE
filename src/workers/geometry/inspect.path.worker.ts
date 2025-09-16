import { InspectPathResult } from "./dto";
import { move } from "piscina";

function __makeSegment(path: Float32Array): Float32Array {
    const segments = new Float32Array(path.length - 2);

    for (let i = 0; i < path.length - 3; i += 2) {
        segments[i] = path[i + 2] - path[i];
        segments[i + 1] = path[i + 3] - path[i + 1];
    }

    return segments;
}

export default function (path: Float32Array): InspectPathResult {

    if (path.length % 2 !== 0)
        throw RangeError("Length of path should be even");

    if (path.length < 4)
        throw RangeError("Length of path should be greater than 4");

    const segments: Float32Array = __makeSegment(path); // segments.length === path.length - 2
    const progresses = new Float32Array(path.length / 2);
    const bearings = new Float32Array(progresses.length);

    let x0 = 0;
    let y0 = 0;
    let len = 0;

    for (let i = 0; i < segments.length - 1; i += 2) {
        const x = segments[i];
        const y = segments[i + 1];

        progresses[i / 2] = len;
        bearings[i / 2] = (Math.atan2(x - x0, y - y0) * 180) / Math.PI;

        len += Math.hypot(x, y);
        x0 = x;
        y0 = y;
    }

    progresses[progresses.length - 1] = len;
    bearings[bearings.length - 1] = 0;

    return {
        progress: move(progresses) as Float32Array,
        bearing: move(bearings) as Float32Array,
    };
}