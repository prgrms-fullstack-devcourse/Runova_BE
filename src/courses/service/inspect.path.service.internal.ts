import { Coordinates, Location } from "../../common/geo";
import { CourseNodeDTO, InspectPathResult } from "../dto";
import { convertGlobeToProjected } from "../../config/proj4";

export function inspectPath(
    path: Location[],
): InspectPathResult {
    const line = path.map(convertGlobeToProjected);
    const segments = __makeSegments(line);

    let length = 0;
    let prevSeg: [number, number] = [0, 0];
    const nodes: CourseNodeDTO[] = [];


    segments.forEach((seg, i) => {

        nodes.push({
            coordinates: line[i],
            progress: length,
            bearing: __bearing(prevSeg, seg)
        });

        length += __length(seg);
        prevSeg = seg;
    });

    nodes.push({
        coordinates: line.at(-1)!,
        progress: length,
        bearing: 0
    });

   return { length, nodes };
}


function __makeSegments(line: Coordinates[]): [number, number][] {
    const results: [number, number][] = [];

    for (let i = 0; i !== line.length - 1; ++i) {
        const { x: x1, y: y1 } = line[i];
        const { x: x2, y: y2 } = line[i + 1];
        results.push([x2 - x1, y2 - y1]);
    }

    return results;
}

/**
 *
 * return length of segment in km
 */
function __length(seg: [number, number]): number {
    return Math.sqrt(
        seg.reduce(
            (acc, curr) => acc + curr * curr,
            0
        )
    ) / 1000;
}

/**
 *
 * return bearing angle between two segments
 */
function __bearing(
    [x1, y1]: [number, number],
    [x2, y2]: [number, number]
): number {
    return (Math.atan2(x2 - x1, y2 - y1) * 180) / Math.PI;
}













