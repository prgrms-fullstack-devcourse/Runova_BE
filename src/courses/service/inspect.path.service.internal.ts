import { Location, makeDisplacements } from "../../common/geo";
import { CourseNodeDTO, InspectPathResult } from "../dto";
import { globeToProjected } from "../../config/proj4";

export function inspectPath(
    path: Location[],
): InspectPathResult {
    const line = path.map(globeToProjected);
    const displacements = makeDisplacements(line);

    let length = 0;
    const nodes: CourseNodeDTO[] = [];

    displacements.forEach((r, i) => {

        nodes.push({
            coordinates: line[i],
            progress: length,
            bearing: r.bearing()
        });

        length += r.length();
    });

    nodes.push({
        coordinates: line.at(-1)!,
        progress: length,
        bearing: 0
    });

   return { length, nodes };
}











