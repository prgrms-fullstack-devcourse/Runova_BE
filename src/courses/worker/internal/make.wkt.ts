
// assume path.length is even and path is not empty
export function makeWKT(path: Float32Array, srid: number): string {
    const inner: string = [...__PointExpressions(path)].join(',');
    return `SRID=${srid};LINESTRING(${inner})`;
}

function* __PointExpressions(path: Float32Array): IterableIterator<string> {
    for (let i = 0; i < path.length - 1; i += 2)
        yield `${path[i]} ${path[i + 1]}`;
}