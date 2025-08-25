
export function applyOp(
    u: number[],
    v: number[],
    op: (ui: number, vi: number) => number
): number[] {

    if (u.length !== v.length)
        throw Error("Length of two input arrays should be same");

    return u.map((x, idx) => op(x, v[idx]));
}