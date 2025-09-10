import type { InspectPathResult, CourseNodeDTO } from "../dto";

/**
 * Convert a given path to projected coordinates (EPSG:5179),
 * generate WKT, and build course nodes.
 *
 * @param path - Array of [longitude, latitude] pairs
 * @returns InspectPathResult
 */
export function inspectPath(path: [number, number][]): InspectPathResult;

/** @internal */
declare function __makeSegments(path: [number, number][]): [number, number][];

/** @internal */
declare function __makeWKT(srid: number, line: [number, number][]): string;

/** @internal */
declare function __makeCourseNodes(
    path: [number, number][],
    segments5179: [number, number][]
): CourseNodeDTO[];