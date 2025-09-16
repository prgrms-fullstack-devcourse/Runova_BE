import inspectPath from "./inspect.path.worker";

// Mock the move function from piscina to return the original array for testing
jest.mock("piscina", () => ({
    move: (array: any) => array
}));

describe("inspect.path.worker", () => {
    describe("Basic functionality", () => {
        it("should return correct structure with progress and bearing arrays", () => {
            const path = new Float32Array([0, 0, 10, 0, 10, 10]);
            const result = inspectPath(path);

            expect(result).toHaveProperty("progress");
            expect(result).toHaveProperty("bearing");
            expect(result.progress).toBeInstanceOf(Float32Array);
            expect(result.bearing).toBeInstanceOf(Float32Array);
        });

        it("should calculate correct array lengths", () => {
            const path = new Float32Array([0, 0, 10, 0, 10, 10, 0, 10]);
            const result = inspectPath(path);

            expect(result.progress).toHaveLength(4); // path.length / 2
            expect(result.bearing).toHaveLength(4);   // same as progress
        });

        it("should start progress at 0", () => {
            const path = new Float32Array([0, 0, 10, 0, 10, 10]);
            const result = inspectPath(path);

            expect(result.progress[0]).toBe(0);
        });

        it("should set last bearing to 0", () => {
            const path = new Float32Array([0, 0, 10, 0, 10, 10]);
            const result = inspectPath(path);

            expect(result.bearing[result.bearing.length - 1]).toBe(0);
        });

        it("should calculate progress values that increase monotonically", () => {
            const path = new Float32Array([0, 0, 10, 0, 10, 10, 0, 10]);
            const result = inspectPath(path);

            for (let i = 1; i < result.progress.length; i++) {
                expect(result.progress[i]).toBeGreaterThanOrEqual(result.progress[i - 1]);
            }
        });
    });

    describe("Mathematical calculations", () => {
        it("should calculate correct distance for simple horizontal line", () => {
            const path = new Float32Array([0, 0, 10, 0]);
            const result = inspectPath(path);

            expect(result.progress[0]).toBe(0);
            expect(result.progress[1]).toBe(10);
        });

        it("should calculate correct distance for simple vertical line", () => {
            const path = new Float32Array([0, 0, 0, 10]);
            const result = inspectPath(path);

            expect(result.progress[0]).toBe(0);
            expect(result.progress[1]).toBe(10);
        });

        it("should calculate correct distance for diagonal line", () => {
            const path = new Float32Array([0, 0, 3, 4]);
            const result = inspectPath(path);

            expect(result.progress[0]).toBe(0);
            expect(result.progress[1]).toBe(5); // 3-4-5 triangle
        });

        it("should calculate bearings in degrees", () => {
            const path = new Float32Array([0, 0, 10, 0, 10, 10]);
            const result = inspectPath(path);

            expect(result.bearing[0]).toBeCloseTo(90); // East
            expect(result.bearing[1]).toBeCloseTo(-45);  // Direction change from east to north
            expect(result.bearing[2]).toBe(0);         // Last bearing always 0
        });

        it("should handle complex path with multiple segments", () => {
            const path = new Float32Array([0, 0, 10, 0, 20, 10, 30, 10]);
            const result = inspectPath(path);

            expect(result.progress).toHaveLength(4);
            expect(result.bearing).toHaveLength(4);
            expect(result.progress[0]).toBe(0);
            expect(result.progress[result.progress.length - 1]).toBeGreaterThan(0);
        });
    });

    describe("Edge cases", () => {
        it("should throw error for odd-length path", () => {
            const path = new Float32Array([0, 0, 10]);
            expect(() => inspectPath(path)).toThrow(RangeError);
            expect(() => inspectPath(path)).toThrow("Length of path should be even");
        });

        it("should throw error for path with length < 4", () => {
            const path = new Float32Array([0, 0]);
            expect(() => inspectPath(path)).toThrow(RangeError);
            expect(() => inspectPath(path)).toThrow("Length of path should be greater than 4");
        });

        it("should handle minimum valid path (2 points)", () => {
            const path = new Float32Array([0, 0, 10, 0]);
            const result = inspectPath(path);

            expect(result.progress).toHaveLength(2);
            expect(result.bearing).toHaveLength(2);
            expect(result.progress[0]).toBe(0);
            expect(result.progress[1]).toBe(10);
            expect(result.bearing[1]).toBe(0);
        });

        it("should handle duplicate consecutive points", () => {
            const path = new Float32Array([0, 0, 0, 0, 10, 0]);
            const result = inspectPath(path);

            expect(result.progress[0]).toBe(0);
            expect(result.progress[1]).toBe(0); // No distance for duplicate points
            expect(result.progress[2]).toBe(10);
        });

        it("should handle path with zero-length segments", () => {
            const path = new Float32Array([5, 5, 5, 5, 5, 15]);
            const result = inspectPath(path);

            expect(result.progress[0]).toBe(0);
            expect(result.progress[1]).toBe(0); // Zero length segment
            expect(result.progress[2]).toBe(10); // 10 units up
        });
    });

    describe("Bearing calculations", () => {
        it("should calculate correct bearing for cardinal directions", () => {
            const path = new Float32Array([
                0, 0,   // Start
                10, 0,  // East
                10, 10, // North
                0, 10   // West
            ]);
            const result = inspectPath(path);

            expect(result.bearing[0]).toBeCloseTo(90);   // East direction
            expect(result.bearing[1]).toBeCloseTo(-45);  // Direction change from east to north
            expect(result.bearing[2]).toBeCloseTo(-135); // Direction change from north to west
            expect(result.bearing[3]).toBe(0);           // Last always 0
        });

        it("should handle bearing calculations for diagonal movements", () => {
            const path = new Float32Array([0, 0, 10, 10, 20, 0]);
            const result = inspectPath(path);

            expect(result.bearing[0]).toBeCloseTo(45);   // Northeast direction
            expect(result.bearing[1]).toBeCloseTo(180);  // Direction change (south)
            expect(result.bearing[2]).toBe(0);           // Last always 0
        });

        it("should keep bearings within valid range", () => {
            const path = new Float32Array([0, 0, -10, 0, -10, -10, 0, -10, 10, -10]);
            const result = inspectPath(path);

            for (let i = 0; i < result.bearing.length - 1; i++) {
                expect(result.bearing[i]).toBeGreaterThanOrEqual(-180);
                expect(result.bearing[i]).toBeLessThanOrEqual(180);
            }
        });
    });

    describe("Performance and memory", () => {
        it("should handle large paths efficiently", () => {
            const size = 10000;
            const path = new Float32Array(size);

            for (let i = 0; i < size; i += 2) {
                path[i] = i / 2;
                path[i + 1] = Math.sin(i / 100) * 10;
            }

            const start = performance.now();
            const result = inspectPath(path);
            const end = performance.now();

            expect(result.progress).toHaveLength(size / 2);
            expect(result.bearing).toHaveLength(size / 2);
            expect(end - start).toBeLessThan(100); // Should complete in <100ms
        });

        it("should maintain precision for small increments", () => {
            const path = new Float32Array([
                0, 0,
                0.001, 0.001,
                0.002, 0.002
            ]);
            const result = inspectPath(path);

            expect(result.progress[0]).toBe(0);
            expect(result.progress[1]).toBeCloseTo(Math.sqrt(2) * 0.001, 6);
            expect(result.progress[2]).toBeCloseTo(Math.sqrt(2) * 0.002, 6);
        });
    });

    describe("Zero-copy behavior with piscina", () => {
        it("should return Float32Array instances that can be transferred", () => {
            const path = new Float32Array([0, 0, 10, 0, 10, 10]);
            const result = inspectPath(path);

            expect(result.progress.buffer).toBeDefined();
            expect(result.bearing.buffer).toBeDefined();
            expect(result.progress).toBeInstanceOf(Float32Array);
            expect(result.bearing).toBeInstanceOf(Float32Array);
        });

        it("should maintain array properties after move operation", () => {
            const path = new Float32Array([0, 0, 10, 0, 10, 10, 0, 10]);
            const result = inspectPath(path);

            expect(result.progress).toHaveLength(4);
            expect(result.bearing).toHaveLength(4);
            expect(result.progress.byteLength).toBe(16); // 4 * 4 bytes
            expect(result.bearing.byteLength).toBe(16);
        });
    });

    describe("Internal segment calculation", () => {
        it("should create correct segment vectors", () => {
            const path = new Float32Array([0, 0, 10, 5, 20, 15]);
            const result = inspectPath(path);

            expect(result.progress[0]).toBe(0);

            const expectedDist1 = Math.sqrt(10*10 + 5*5);
            const expectedDist2 = Math.sqrt(10*10 + 10*10);

            expect(result.progress[1]).toBeCloseTo(expectedDist1);
            expect(result.progress[2]).toBeCloseTo(expectedDist1 + expectedDist2);
        });
    });
});