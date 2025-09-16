
export function makeSegments(path: Float32Array): Float32Array {
    const segments = new Float32Array(path.length - 2);

    for (let i = 0; i < path.length - 3; i += 2) {
        segments[i] = path[i + 2] - path[i];
        segments[i + 1] = path[i + 3] - path[i + 1];
    }

    return segments;
}