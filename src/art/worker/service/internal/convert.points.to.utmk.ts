import { convertToUTMK } from "../../../../common/geo";

export function convertPointsToUTMK(points: Float32Array): void {

    for (let i = 0; i < points.length - 1; i += 2) {
        const [x, y] = convertToUTMK([points[i], points[i + 1]]);
        points[i] = x;
        points[i + 1] = y;
    }

}
