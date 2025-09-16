import { convertToUTMK } from "../../common/geo";

export default function (points: Float32Array): Float32Array {

    if (points.length < 2 || points.length % 2 !== 0)
        throw RangeError("length of points must be greater than two points and even");

    for (let i = 0; i < points.length - 1; i += 2) {
        const [x, y] = convertToUTMK(points[i], points[i + 1]);
        points[i] = x;
        points[i + 1] = y;
    }

    return points;
}