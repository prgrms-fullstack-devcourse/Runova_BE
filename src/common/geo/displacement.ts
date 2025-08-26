import { Coordinates } from "./coordinates";

export class Displacement {

    constructor(
        public readonly dx: number,
        public readonly dy: number,
    ) {}

    /**
     * return length in km
     */
    length(): number {
        return Math.sqrt(
            this.dx * this.dx + this.dy * this.dy
        ) / 1000;
    }

    /**
     * return bearing angle in degree,
     * the result will be normalized between [-180, 180]
     */
    bearing(): number {
        return (Math.atan2(this.dx, this.dy) * 180) / Math.PI;
    }
}

export function makeDisplacement(
    from: Coordinates,
    to: Coordinates
): Displacement {
    return new Displacement(
        to.x - from.x,
        to.y - from.y,
    );
}

export function makeDisplacements(line: Coordinates[]): Displacement[] {
    const results: Displacement[] = [];

    for (let  i = 0; i !== line.length - 1; ++i)
        results.push(makeDisplacement(line[i], line[i+1]));

    return results;
}