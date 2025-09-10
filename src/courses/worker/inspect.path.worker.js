const converter = require("../../common/geo/converter");
const workerpool = require("workerpool");

/**
 *
 * @param {[number, number][]} path
 * @return {import("../dto").InspectPathResult}
 */
export function inspectPath(path) {
    const path5179 = path.map(p => converter.forward(p));
    const wkt5179 = __makeWKT(5179, path5179);
    const nodes = __makeCourseNodes(path, __makeSegments(path5179));
    return { wkt5179, nodes };
}

/**
 *
 * @param {[number, number][]} path
 * @return {[number, number][]}
 * @private
 */
function __makeSegments(path) {
    const segments = [];

    for (let  i = 0; i !== path.length - 1; ++i) {
        const [x1, y1] = path[i];
        const [x2, y2] = path[i + 1];
        segments.push([x2 - x1, y2 - y1]);
    }

    return segments;
}

/**
 *
 * @param {number} srid
 * @param {[number, number][]} line
 * @return {string}
 * @private
 */
function __makeWKT(srid, line) {

    const inner = line
        .map(p => p.join(' '))
        .join(',');

    return `SRID=${srid};LINESTRING(${inner})`;
}

/**
 *
 * @param {[number, number][]} path
 * @param {[number, number][]} segments5179
 * @return {import("../dto").CourseNodeDTO[]}
 * @private
 */
function __makeCourseNodes(path, segments5179) {
    const nodes = [];
    let length = 0;
    let prevSeg = [0, 0];

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
        location: path[path.length - 1],
        progress: length,
        bearing: 0
});

    return nodes;
}

workerpool.worker({ inspectPath });