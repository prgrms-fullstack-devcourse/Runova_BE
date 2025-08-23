import { applyOp } from "./index";

export function azimuth(
    r1: [number, number],
    r2: [number, number],
): number {

    const [dx, dy] = applyOp(
        r2, r1,
        (q2, q1) => q2 - q1
    );

    return Math.atan2(dy, dx);
}

