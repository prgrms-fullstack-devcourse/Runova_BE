
export function norm2(r: number[]): number {
    return Math.sqrt(
        r.reduce(
            (acc, x) => acc + x * x,
            0
        )
    );
}