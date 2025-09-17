import { makeSegments } from "./make.segments";

describe("makeSegments", () => {
    it("should create segments from a simple square path", () => {
        const path = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
        const result = makeSegments(path);

        expect(result).toEqual(new Float32Array([1, 0, 0, 1, -1, 0]));
        expect(result.length).toBe(path.length - 2);
    });

    it("should create segments from a triangular path", () => {
        const path = new Float32Array([0, 0, 3, 0, 1.5, 2.6, 0, 0]);
        const result = makeSegments(path);

        const expected = new Float32Array([
            3, 0,           // (3,0) - (0,0)
            -1.5, 2.6,      // (1.5,2.6) - (3,0)
            -1.5, -2.6      // (0,0) - (1.5,2.6)
        ]);

        expect(result).toEqual(expected);
        expect(result.length).toBe(6);
    });

    it("should handle minimum valid path length (4 elements)", () => {
        const path = new Float32Array([0, 0, 5, 3]);
        const result = makeSegments(path);

        expect(result).toEqual(new Float32Array([5, 3]));
        expect(result.length).toBe(2);
    });

    it("should handle paths with negative coordinates", () => {
        const path = new Float32Array([-2, -3, 1, -1, 4, 2]);
        const result = makeSegments(path);

        const expected = new Float32Array([
            3, 2,   // (1,-1) - (-2,-3)
            3, 3    // (4,2) - (1,-1)
        ]);

        expect(result).toEqual(expected);
    });

    it("should handle paths with decimal coordinates", () => {
        const path = new Float32Array([1.5, 2.7, 3.2, 4.1, 5.8, 6.9]);
        const result = makeSegments(path);

        expect(result[0]).toBeCloseTo(1.7, 5);
        expect(result[1]).toBeCloseTo(1.4, 5);
        expect(result[2]).toBeCloseTo(2.6, 5);
        expect(result[3]).toBeCloseTo(2.8, 5);
        expect(result.length).toBe(4);
    });

    it("should handle larger paths correctly", () => {
        const path = new Float32Array([0, 0, 1, 1, 2, 0, 3, 1, 4, 0]);
        const result = makeSegments(path);

        const expected = new Float32Array([
            1, 1,   // (1,1) - (0,0)
            1, -1,  // (2,0) - (1,1)
            1, 1,   // (3,1) - (2,0)
            1, -1   // (4,0) - (3,1)
        ]);

        expect(result).toEqual(expected);
        expect(result.length).toBe(8);
    });

    it("should maintain Float32Array type for result", () => {
        const path = new Float32Array([0, 0, 1, 1]);
        const result = makeSegments(path);

        expect(result).toBeInstanceOf(Float32Array);
    });

    it("should handle zero-length segments", () => {
        const path = new Float32Array([1, 1, 1, 1, 2, 2]);
        const result = makeSegments(path);

        const expected = new Float32Array([
            0, 0,   // (1,1) - (1,1) = (0,0)
            1, 1    // (2,2) - (1,1) = (1,1)
        ]);

        expect(result).toEqual(expected);
    });

    it.each([
        [6, 1000],
        [10, 10000],
        [100, 100000]
    ])("should handle performance with %i points (%i coordinates)", (points, iterations) => {
        const path = new Float32Array(points * 2);
        for (let i = 0; i < path.length; i += 2) {
            path[i] = Math.random() * 100;
            path[i + 1] = Math.random() * 100;
        }

        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            makeSegments(path);
        }
        const end = performance.now();

        console.log(`makeSegments took ${end - start}ms for ${iterations} iterations with ${points} points`);

        const result = makeSegments(path);
        expect(result.length).toBe(path.length - 2);
        expect(result).toBeInstanceOf(Float32Array);
    });
});