import { InspectPathResult } from "../../dto";

export function inspectSegments(
    segments: Float32Array,
): Omit<InspectPathResult, "wkt5179"> {
    const progresses = new Float32Array(segments.length / 2 + 1);
    const bearings = new Float32Array(progresses.length);

    let len = 0;
    let x0 = 0;
    let y0 = 0;

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

    return { progresses, bearings };
}