import proj from "proj4";
import { Coordinates } from "../../common/geo";
import { CourseNodeDTO, InspectPathResult } from "../dto";
import { applyOp, norm2 } from "../../utils/math";
import { CRS_NAME } from "../../config/proj4";

export function inspectPath(
    path: Coordinates[],
): InspectPathResult {

   const segments = __toSegments(
       path.map(
           p =>  proj(
               "EPSG:4326",
               CRS_NAME,
               [p.lon, p.lat],
           )
       )
   );

    let length = 0;
    const nodes: CourseNodeDTO[] = [];

    segments.forEach((seg, i) => {

        nodes.push({
            location: path[i],
            progress: length,
            bearing: (Math.atan2(seg[0], seg[1]) * 180) / Math.PI
        });

        length += norm2(seg);
    });

    nodes.push({
        location: path.at(-1)!,
        progress: length,
        bearing: 0
    });

   return {
       length: length / 1000,
       nodes: nodes.map(node => {
           node.progress /= length;
           return node;
       }),
   };
}

function __toSegments(line: [number, number][]): [number, number][] {
    const segments: [number, number][] = [];

    for (let  i = 1; i !== line.length; ++i) {
        segments.push(
            applyOp(
                line[i], line[i - 1],
                (a, b) => a - b
            ) as [number, number]
        );
    }

    return segments;
}









