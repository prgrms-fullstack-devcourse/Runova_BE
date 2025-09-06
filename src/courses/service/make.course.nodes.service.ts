import { Inject, Injectable, Logger } from "@nestjs/common";
import { WorkerPoolService } from "../../config/workerpool";
import { CourseNodeDTO } from "../dto";
import converter from "../../common/geo/converter";

@Injectable()
export class MakeCourseNodesService {
    private readonly logger: Logger = new Logger(MakeCourseNodesService.name);

    constructor(
       @Inject(WorkerPoolService)
       private readonly poolService: WorkerPoolService,
    ) {}

    async makeCourseNodes(path: [number, number][]): Promise<CourseNodeDTO[]> {
        return await this.poolService
            .exec(__makeCourseNodes, path)
            .catch(err => {
                this.logger.error(err);
                throw err;
            });
    }
}

function __makeCourseNodes(path: [number, number][]): CourseNodeDTO[] {
    const segments: [number, number][] = __makeSegments(
        path.map(p => converter.forward(p))
    );

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

function __makeSegments(path: [number, number][]): [number, number][] {
    const segments: [number, number][] = [];

    for (let  i = 0; i !== path.length - 1; ++i) {
        const [x1, y1] = path[i];
        const [x2, y2] = path[i + 1];
        segments.push([x2 - x1, y2 - y1]);
    }

    return segments;
}
