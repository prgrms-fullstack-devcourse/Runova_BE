
export function norm2(r: number[]): number {
    return Math.sqrt(
        r.map(x => x * x)
            .reduce((acc, curr) => acc + curr)
    );
}