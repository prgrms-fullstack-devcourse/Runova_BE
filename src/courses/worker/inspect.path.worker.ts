import { InspectPathResult } from "../dto";
import { move } from "piscina";
import { inspectSegments, makeSegments, makeWKT } from "./internal";
import { convertPointsToUTMK } from "../../utils/convert.points.to.utm-k";

export default function (path: Float32Array): InspectPathResult {

    if (path.length % 2 !== 0)
        throw RangeError("Length of path should be even");

    if (path.length < 4)
        throw RangeError("Length of path should be greater than 4");

    const path5179: Float32Array = convertPointsToUTMK(path);
    const wkt5179 = makeWKT(path5179, 5179);
    const { progresses, bearings } = inspectSegments(makeSegments(path5179));

    return {
        wkt5179,
        progresses: move(progresses) as Float32Array,
        bearings: move(bearings) as Float32Array,
    };
}