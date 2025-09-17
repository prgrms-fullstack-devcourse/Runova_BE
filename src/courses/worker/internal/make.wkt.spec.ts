import { makeWKT } from "./make.wkt";

describe("makeWKT", () => {
    it("should create WKT LINESTRING from simple path", () => {
        const path = new Float32Array([0, 0, 1, 1]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toBe("SRID=4326;LINESTRING(0 0,1 1)");
    });

    it("should handle multiple points in path", () => {
        const path = new Float32Array([0, 0, 1, 1, 2, 0, 3, 3]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toBe("SRID=4326;LINESTRING(0 0,1 1,2 0,3 3)");
    });

    it("should handle negative coordinates", () => {
        const path = new Float32Array([-1, -2, 3, -4, 5, 6]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toBe("SRID=4326;LINESTRING(-1 -2,3 -4,5 6)");
    });

    it("should handle decimal coordinates", () => {
        const path = new Float32Array([1.5, 2.7, 3.14, 4.25]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toMatch(/^SRID=4326;LINESTRING\(1\.5 2\.7\d*,3\.14\d* 4\.25\)$/);
        expect(result).toContain("SRID=4326");
        expect(result).toContain("LINESTRING(1.5");
        expect(result).toContain("4.25)");
    });

    it("should handle different SRID values", () => {
        const path = new Float32Array([0, 0, 1, 1]);

        expect(makeWKT(path, 4326)).toBe("SRID=4326;LINESTRING(0 0,1 1)");
        expect(makeWKT(path, 3857)).toBe("SRID=3857;LINESTRING(0 0,1 1)");
        expect(makeWKT(path, 2154)).toBe("SRID=2154;LINESTRING(0 0,1 1)");
    });

    it("should handle zero SRID", () => {
        const path = new Float32Array([0, 0, 1, 1]);
        const result = makeWKT(path, 0);

        expect(result).toBe("SRID=0;LINESTRING(0 0,1 1)");
    });

    it("should handle large coordinate values", () => {
        const path = new Float32Array([1000000, 2000000, 3000000, 4000000]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toBe("SRID=4326;LINESTRING(1000000 2000000,3000000 4000000)");
    });

    it("should handle very small coordinate values", () => {
        const path = new Float32Array([0.001, 0.002, 0.003, 0.004]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toMatch(/^SRID=4326;LINESTRING\(0\.001\d* 0\.002\d*,0\.003\d* 0\.004\d*\)$/);
        expect(result).toContain("SRID=4326");
        expect(result).toContain("LINESTRING(0.001");
        expect(result).toContain("0.004");
    });

    it("should handle complex path with many points", () => {
        const path = new Float32Array([
            0, 0,     // Point 1
            1, 0,     // Point 2
            1, 1,     // Point 3
            0, 1,     // Point 4
            0, 0      // Point 5 (closing the square)
        ]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toBe("SRID=4326;LINESTRING(0 0,1 0,1 1,0 1,0 0)");
    });

    it("should handle path representing a triangle", () => {
        const path = new Float32Array([0, 0, 3, 0, 1.5, 2.6, 0, 0]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toBe("SRID=4326;LINESTRING(0 0,3 0,1.5 2.5999999046325684,0 0)");
    });

    it("should format coordinates as strings correctly", () => {
        const path = new Float32Array([10.123456789, 20.987654321]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        // Float32Array has limited precision, so we test that it's formatted as a string
        expect(result).toMatch(/^SRID=4326;LINESTRING\(\d+\.\d+ \d+\.\d+\)$/);
        expect(result).toContain("SRID=4326");
        expect(result).toContain("LINESTRING");
    });

    it("should handle integer coordinates", () => {
        const path = new Float32Array([10, 20, 30, 40]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toBe("SRID=4326;LINESTRING(10 20,30 40)");
    });

    it("should handle mixed integer and decimal coordinates", () => {
        const path = new Float32Array([1, 2.5, 3.7, 4]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toBe("SRID=4326;LINESTRING(1 2.5,3.700000047683716 4)");
    });

    it.each([
        [2, 1000],
        [10, 10000],
        [100, 100000]
    ])("should handle performance with %i points (%i iterations)", (points, iterations) => {
        const path = new Float32Array(points * 2);
        for (let i = 0; i < path.length; i += 2) {
            path[i] = Math.random() * 180 - 90;     // latitude range
            path[i + 1] = Math.random() * 360 - 180; // longitude range
        }

        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            makeWKT(path, 4326);
        }
        const end = performance.now();

        console.log(`makeWKT took ${end - start}ms for ${iterations} iterations with ${points} points`);

        const result = makeWKT(path, 4326);
        expect(result).toMatch(/^SRID=4326;LINESTRING\(.+\)$/);
        expect(result.split(',').length).toBe(points);
    });

    it("should return string type", () => {
        const path = new Float32Array([0, 0, 1, 1]);
        const result = makeWKT(path, 4326);

        expect(typeof result).toBe("string");
    });

    it("should handle path with zero coordinates", () => {
        const path = new Float32Array([0, 0, 0, 1, 1, 0]);
        const srid = 4326;
        const result = makeWKT(path, srid);

        expect(result).toBe("SRID=4326;LINESTRING(0 0,0 1,1 0)");
    });

    describe("WKT format validation", () => {
        it("should always start with SRID=", () => {
            const path = new Float32Array([1, 2, 3, 4]);
            const result = makeWKT(path, 4326);

            expect(result).toMatch(/^SRID=\d+;/);
        });

        it("should contain LINESTRING format", () => {
            const path = new Float32Array([1, 2, 3, 4]);
            const result = makeWKT(path, 4326);

            expect(result).toContain("LINESTRING(");
            expect(result).toMatch(/LINESTRING\(.+\)$/);
        });

        it("should have proper coordinate separation", () => {
            const path = new Float32Array([1, 2, 3, 4, 5, 6]);
            const result = makeWKT(path, 4326);

            // Should have space between x and y coordinates
            expect(result).toMatch(/\d+ \d+/);
            // Should have comma between point pairs
            expect(result).toMatch(/\d+ \d+,\d+ \d+/);
        });
    });
});