import { Inject, Injectable, Logger } from "@nestjs/common";
import { WORKER_POOL } from "../../config/workerpool";
import { Pool } from "workerpool";
import { Line, Position } from "../../common/geometry";
import { CourseNode } from "../../modules/courses";
import converter from "../../common/geometry/converter";

@Injectable()
export class MakeCourseNodesService {
    private readonly logger: Logger = new Logger(MakeCourseNodesService.name);

    constructor(
       @Inject(WORKER_POOL)
       private readonly pool: Pool,
    ) {}

    async makeCourseNodes(path: Line): Promise<CourseNode[]> {
        return await this.pool.exec(__makeCourseNodes, [path])
            .catch(err => {
                this.logger.error(err);
                throw err;
            });

    }
}

function __makeCourseNodes(path: Line): CourseNode[] {

    const segments: Line = __makeSegments(
        path.map(pos => converter.forward(pos))
    );

    const nodes: CourseNode[] = [];
    let length = 0;
    let prevSeg: Position = [0, 0];

    segments.forEach((seg, i) => {
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

function __makeSegments(path: Line): Line {
    const segments: [number, number][] = [];

    for (let  i = 0; i !== path.length - 1; ++i) {
        const [x1, y1] = path[i];
        const [x2, y2] = path[i + 1];
        segments.push([x2 - x1, y2 - y1]);
    }

    return segments;
}

