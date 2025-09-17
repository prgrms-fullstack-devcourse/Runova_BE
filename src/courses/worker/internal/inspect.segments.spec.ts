import { inspectSegments } from "./inspect.segments";

describe("inspectSegments", () => {
    it("should calculate progresses and bearings for simple horizontal segment", () => {
        const segments = new Float32Array([1, 0]); // One segment: (1, 0)
        const result = inspectSegments(segments);

        expect(result.progresses).toEqual(new Float32Array([0, 1]));
        expect(result.bearings).toEqual(new Float32Array([90, 0]));
    });

    it("should calculate progresses and bearings for simple vertical segment", () => {
        const segments = new Float32Array([0, 1]); // One segment: (0, 1)
        const result = inspectSegments(segments);

        expect(result.progresses).toEqual(new Float32Array([0, 1]));
        expect(result.bearings).toEqual(new Float32Array([0, 0]));
    });

    it("should handle multiple segments forming a square", () => {
        const segments = new Float32Array([
            1, 0,   // Right: (1, 0)
            0, 1,   // Up: (0, 1)
            -1, 0,  // Left: (-1, 0)
            0, -1   // Down: (0, -1)
        ]);
        const result = inspectSegments(segments);

        expect(result.progresses).toEqual(new Float32Array([0, 1, 2, 3, 4]));
        // Bearings are calculated relative to previous position
        expect(result.bearings[0]).toBe(90);     // First segment: (1,0) from origin
        expect(result.bearings[1]).toBeCloseTo(-45, 5);  // (0,1) from (1,0)
        expect(result.bearings[2]).toBeCloseTo(-135, 5); // (-1,0) from (1,1)
        expect(result.bearings[3]).toBeCloseTo(135, 5);  // (0,-1) from (0,1)
        expect(result.bearings[4]).toBe(0);      // Final bearing always 0
    });

    it("should handle diagonal segments", () => {
        const segments = new Float32Array([
            1, 1,   // Northeast: (1, 1)
            -1, 1   // Northwest: (-1, 1)
        ]);
        const result = inspectSegments(segments);

        const expectedLength1 = Math.sqrt(2); // √(1² + 1²)
        const expectedLength2 = Math.sqrt(2); // √(1² + 1²)

        expect(result.progresses[0]).toBe(0);
        expect(result.progresses[1]).toBeCloseTo(expectedLength1, 5);
        expect(result.progresses[2]).toBeCloseTo(expectedLength1 + expectedLength2, 5);

        expect(result.bearings[0]).toBeCloseTo(45, 5);  // 45° for northeast from origin
        expect(result.bearings[1]).toBeCloseTo(-90, 5); // -90° for (-1,1) from (1,1)
        expect(result.bearings[2]).toBe(0);
    });

    it("should handle negative coordinates", () => {
        const segments = new Float32Array([-1, -1]); // Southwest: (-1, -1)
        const result = inspectSegments(segments);

        const expectedLength = Math.sqrt(2);
        expect(result.progresses).toEqual(new Float32Array([0, expectedLength]));
        expect(result.bearings[0]).toBeCloseTo(-135, 5); // -135° for southwest
        expect(result.bearings[1]).toBe(0);
    });

    it("should handle zero-length segment", () => {
        const segments = new Float32Array([0, 0]); // No movement
        const result = inspectSegments(segments);

        expect(result.progresses).toEqual(new Float32Array([0, 0]));
        expect(result.bearings).toEqual(new Float32Array([0, 0]));
    });

    it("should handle mixed segment lengths", () => {
        const segments = new Float32Array([
            2, 0,   // Length 2 horizontal
            0, 3    // Length 3 vertical
        ]);
        const result = inspectSegments(segments);

        expect(result.progresses).toEqual(new Float32Array([0, 2, 5]));
        expect(result.bearings[0]).toBe(90); // East from origin
        expect(result.bearings[1]).toBeCloseTo(-33.690067525979785, 5); // (0,3) from (2,0)
        expect(result.bearings[2]).toBe(0);
    });

    it("should calculate correct bearings for all cardinal directions", () => {
        const segments = new Float32Array([
            0, 1,   // North from origin
            1, 0,   // East from (0,1)
            0, -1,  // South from (1,0)
            -1, 0   // West from (0,-1)
        ]);
        const result = inspectSegments(segments);

        expect(result.bearings[0]).toBe(0);      // North from origin
        expect(result.bearings[1]).toBe(135);    // (1,0) from (0,1)
        expect(result.bearings[2]).toBe(-135);   // (0,-1) from (1,0)
        expect(result.bearings[3]).toBe(-45);    // (-1,0) from (0,-1)
        expect(result.bearings[4]).toBe(0);      // Final bearing (always 0)
    });

    it("should handle very small segments", () => {
        const segments = new Float32Array([0.001, 0.001]);
        const result = inspectSegments(segments);

        const expectedLength = Math.hypot(0.001, 0.001);
        expect(result.progresses[0]).toBe(0);
        expect(result.progresses[1]).toBeCloseTo(expectedLength, 5);
        expect(result.bearings[0]).toBeCloseTo(45, 5);
        expect(result.bearings[1]).toBe(0);
    });

    it("should handle large segments", () => {
        const segments = new Float32Array([1000, 2000]);
        const result = inspectSegments(segments);

        const expectedLength = Math.hypot(1000, 2000);
        expect(result.progresses).toEqual(new Float32Array([0, expectedLength]));
        expect(result.bearings[0]).toBeCloseTo(Math.atan2(1000, 2000) * 180 / Math.PI, 5);
        expect(result.bearings[1]).toBe(0);
    });

    it("should return correct array lengths", () => {
        const segments = new Float32Array([1, 1, 2, 2, 3, 3]); // 3 segments
        const result = inspectSegments(segments);

        expect(result.progresses.length).toBe(4); // segments.length / 2 + 1
        expect(result.bearings.length).toBe(4);   // same as progresses
    });

    it("should maintain Float32Array types", () => {
        const segments = new Float32Array([1, 0]);
        const result = inspectSegments(segments);

        expect(result.progresses).toBeInstanceOf(Float32Array);
        expect(result.bearings).toBeInstanceOf(Float32Array);
    });

    it("should calculate cumulative distances correctly", () => {
        const segments = new Float32Array([
            3, 0,   // Length 3
            0, 4,   // Length 4
            5, 0    // Length 5
        ]);
        const result = inspectSegments(segments);

        expect(result.progresses[0]).toBe(0);  // Start
        expect(result.progresses[1]).toBe(3);  // After first segment
        expect(result.progresses[2]).toBe(7);  // After second segment (3 + 4)
        expect(result.progresses[3]).toBe(12); // After third segment (3 + 4 + 5)
    });

    it("should handle complex path with changing directions", () => {
        const segments = new Float32Array([
            1, 1,    // Northeast
            -2, 1,   // Northwest from (1,1)
            0, -2    // South from (-1,2)
        ]);
        const result = inspectSegments(segments);

        const len1 = Math.hypot(1, 1);
        const len2 = Math.hypot(2, 1);
        const len3 = 2;

        expect(result.progresses[0]).toBe(0);
        expect(result.progresses[1]).toBeCloseTo(len1, 5);
        expect(result.progresses[2]).toBeCloseTo(len1 + len2, 5);
        expect(result.progresses[3]).toBeCloseTo(len1 + len2 + len3, 5);

        // Check bearings are calculated relative to previous position
        expect(result.bearings[0]).toBeCloseTo(45, 5); // Northeast from origin
        expect(result.bearings[3]).toBe(0); // Final bearing always 0
    });

    it("should handle single point (empty segments)", () => {
        const segments = new Float32Array([]); // Empty segments
        const result = inspectSegments(segments);

        expect(result.progresses).toEqual(new Float32Array([0]));
        expect(result.bearings).toEqual(new Float32Array([0]));
    });

    it.each([
        [2, 1000],
        [10, 10000],
        [100, 100000]
    ])("should handle performance with %i segments (%i iterations)", (segmentCount, iterations) => {
        const segments = new Float32Array(segmentCount * 2);
        for (let i = 0; i < segments.length; i += 2) {
            segments[i] = Math.random() * 10 - 5;     // x component
            segments[i + 1] = Math.random() * 10 - 5; // y component
        }

        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            inspectSegments(segments);
        }
        const end = performance.now();

        console.log(`inspectSegments took ${end - start}ms for ${iterations} iterations with ${segmentCount} segments`);

        const result = inspectSegments(segments);
        expect(result.progresses.length).toBe(segmentCount + 1);
        expect(result.bearings.length).toBe(segmentCount + 1);
        expect(result.progresses).toBeInstanceOf(Float32Array);
        expect(result.bearings).toBeInstanceOf(Float32Array);
    });

    describe("bearing calculations", () => {
        it("should use atan2(x-x0, y-y0) formula correctly", () => {
            // Test the specific formula used: atan2(x - x0, y - y0)
            const segments = new Float32Array([1, 0, 0, 1]); // Right then up
            const result = inspectSegments(segments);

            // First bearing: atan2(1-0, 0-0) = atan2(1, 0) = 90°
            expect(result.bearings[0]).toBe(90);
            // Second bearing: atan2(0-1, 1-0) = atan2(-1, 1) = -45°
            expect(result.bearings[1]).toBeCloseTo(-45, 5);
        });

        it("should handle coordinate system correctly", () => {
            // Test that the coordinate system matches expectations with relative positioning
            const segments = new Float32Array([
                0, 1,   // North from origin
                1, 0,   // To (1,0) from (0,1)
                0, -1,  // To (0,-1) from (1,0)
                -1, 0   // To (-1,0) from (0,-1)
            ]);
            const result = inspectSegments(segments);

            expect(result.bearings[0]).toBe(0);      // North from origin: 0°
            expect(result.bearings[1]).toBe(135);    // (1,0) from (0,1): 135°
            expect(result.bearings[2]).toBe(-135);   // (0,-1) from (1,0): -135°
            expect(result.bearings[3]).toBe(-45);    // (-1,0) from (0,-1): -45°
        });
    });

    describe("return type validation", () => {
        it("should return object with progresses and bearings properties", () => {
            const segments = new Float32Array([1, 1]);
            const result = inspectSegments(segments);

            expect(result).toHaveProperty('progresses');
            expect(result).toHaveProperty('bearings');
            expect(Object.keys(result)).toEqual(['progresses', 'bearings']);
        });

        it("should not include wkt5179 property", () => {
            const segments = new Float32Array([1, 1]);
            const result = inspectSegments(segments);

            expect(result).not.toHaveProperty('wkt5179');
        });
    });
});