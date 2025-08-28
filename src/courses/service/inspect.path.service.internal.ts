import { Coordinates } from "../../common/geo";
import { CourseNodeDTO, InspectPathResult } from "../dto";
import converter from "../../config/proj4";

export function inspectPath(
    path: Coordinates[],
): InspectPathResult {
   const segments: [number, number][] = __makeSegments(path);
   const nodes: CourseNodeDTO[] = [];
   let length = 0;
   let prevSeg: [number, number] = [0, 0];

   segments.forEach((seg, i) => {
       const east = seg[0] - prevSeg[0];
       const north = seg[1] - prevSeg[1];

        nodes.push({
            location: path[i],
            progress: length,
            bearing: (Math.atan2(east, north) * 180) / Math.PI
        });

        // m에서 km로 단위 변환
        length += Math.sqrt(seg[0] * seg[0] + seg[1] * seg[1]) / 1000;
        prevSeg = seg;
    });

    nodes.push({
        location: path.at(-1)!,
        progress: length,
        bearing: 0
    });

   return { length, nodes };
}

function __makeSegments(path: Coordinates[]): [number, number][] {

    const line = path.map(loc => {
        const pos: [number, number] = [loc.lon, loc.lat];
        return converter.forward(pos);
    });

    const segments: [number, number][] = [];

    for (let  i = 0; i !== line.length - 1; ++i) {
        const [x1, y1] = line[i];
        const [x2, y2] = line[i + 1];
        segments.push([x2 - x1, y2 - y1]);
    }

    return segments;
}











