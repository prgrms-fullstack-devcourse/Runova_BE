import type { CourseNodeDTO, InspectPathResult } from "../dto";
import converter from "../../common/geo/converter";
import workerpool from "workerpool";
import { isMainThread, parentPort } from 'node:worker_threads';
import { resolve } from "node:path";
import { DedicatedWorker } from "../../config/workerpool";

function inspectPath(path: [number, number][]): InspectPathResult {
    const path5179: [number, number][] = path.map(p => converter.forward(p));
    const wkt5179 = __makeWKT(5179, path5179);
    const nodes = __makeCourseNodes(path, __makeSegments(path5179));
    return { wkt5179, nodes };
}

function __makeSegments(path: [number, number][]): [number, number][] {
    const segments: [number, number][] = [];

    for (let  i = 0; i !== path.length - 1; ++i) {
        const [x1, y1] = path[i];
        const [x2, y2] = path[i + 1];
        segments.push([x2 - x1, y2 - y1]);
    }

    return segments;
}

function __makeWKT(srid: number, line: [number, number][]): string {

    const inner = line
        .map(p => p.join(' '))
        .join(',');

    return `SRID=${srid};LINESTRING(${inner})`;
}

function __makeCourseNodes(
    path: [number, number][],
    segments5179: [number, number][],
): CourseNodeDTO[] {
    const nodes: CourseNodeDTO[] = [];
    let length = 0;
    let prevSeg: [number, number] = [0, 0];

    segments5179.forEach((seg, i) => {
        const east = seg[0] - prevSeg[0];
        const north = seg[1] - prevSeg[1];

        nodes.push({
            location: path[i],
            progress: length,
            bearing: (Math.atan2(east, north) * 180) / Math.PI
        });

        length += Math.hypot(...seg);
        prevSeg = seg;
    });

    nodes.push({
        location: path.at(-1)!,
        progress: length,
        bearing: 0
    });

    return nodes;
}



const hasIPC = typeof (process as any).send === 'function';
const inWorkerThread = !isMainThread && typeof parentPort !== 'undefined' && parentPort !== null;
if (hasIPC || inWorkerThread) workerpool.worker({ inspectPath });

export default {
    run: inspectPath,
    filename: resolve(__filename),
} as DedicatedWorker<typeof inspectPath>;


