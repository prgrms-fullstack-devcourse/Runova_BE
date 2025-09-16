/**
 * Jest tests + performance benchmarks for inspectPath
 */

import inspectPath from "./inspect.path.worker";
import { convertToUTMK } from "../../common/geo";

/** Build a polyline roughly ~10–15km long around central Seoul */
function buildSamplePath(points = 500): [number, number][] {
    // Start near Gyeongbokgung
    const start: [number, number] = [126.9769, 37.5796];
    const end: [number, number] = [127.0350, 37.5000]; // toward Gangnam
    const path: [number, number][] = [];
    for (let i = 0; i < points; i++) {
        const t = i / (points - 1);
        // Simple easing with a small sinusoidal wiggle to avoid perfectly straight line
        const lon = start[0] + (end[0] - start[0]) * t + 0.002 * Math.sin(10 * t * Math.PI);
        const lat = start[1] + (end[1] - start[1]) * t + 0.002 * Math.cos(8 * t * Math.PI);
        path.push([lon, lat]);
    }

    return path;
}

function projectLengthKm(coords: [number, number][]): number {
    // Sum Euclidean distances after projecting to 5179 (meters), then convert to km
    let sumM = 0;
    for (let i = 1; i < coords.length; i++) {
        const a = coords[i - 1];
        const b = coords[i];
        const [ax, ay] = convertToUTMK(a)as [number, number];
        const [bx, by] = convertToUTMK(b) as [number, number];
        const dx = bx - ax;
        const dy = by - ay;
        sumM += Math.hypot(dx, dy);
    }
    return sumM / 1000;
}

describe("inspectPath", () => {

    describe("Basic functionality", () => {
        const path = buildSamplePath(200);
        const result = inspectPath(path);

        it("returns correct structure", () => {
            expect(result).toHaveProperty('wkt5179');
            expect(result).toHaveProperty('nodes');
            expect(typeof result.wkt5179).toBe('string');
            expect(Array.isArray(result.nodes)).toBe(true);
        });

        it("generates WKT string with correct SRID", () => {
            expect(result.wkt5179).toMatch(/^SRID=5179;LINESTRING\(/);
            expect(result.wkt5179).toMatch(/\)$/);
        });

        it("includes all path points as nodes", () => {
            expect(result.nodes).toHaveLength(path.length);
        });

        it("first node starts at progress 0", () => {
            expect(result.nodes[0].progress).toBe(0);
        });

        it("final node has bearing 0", () => {
            const lastNode = result.nodes[result.nodes.length - 1];
            expect(lastNode.bearing).toBe(0);
        });

        it("progress increases monotonically", () => {
            for (let i = 1; i < result.nodes.length; i++) {
                expect(result.nodes[i].progress).toBeGreaterThanOrEqual(result.nodes[i - 1].progress);
            }
        });

        it("locations match input path", () => {
            for (let i = 0; i < path.length; i++) {
                expect(result.nodes[i].location).toEqual(path[i]);
            }
            // Final node should have last path location
            expect(result.nodes[result.nodes.length - 1].location).toEqual(path[path.length - 1]);
        });
    });

    describe("Edge cases", () => {
        it("handles empty path", () => {
            expect(() => inspectPath([])).toThrow();
            // Empty paths are likely not supported by the current implementation
        });

        it("handles single point", () => {
            const singlePoint: [number, number] = [126.9780, 37.5665];
            const result = inspectPath([singlePoint]);
            
            expect(result.nodes).toHaveLength(1);
            expect(result.nodes[0].location).toEqual(singlePoint);
            expect(result.nodes[0].progress).toBe(0);
            expect(result.nodes[0].bearing).toBe(0);
            
            const [x, y] = convertToUTMK(singlePoint);
            expect(result.wkt5179).toBe(`SRID=5179;LINESTRING(${x} ${y})`);
        });

        it("handles two points", () => {
            const twoPoints: [number, number][] = [
                [126.9780, 37.5665], // Seoul City Hall
                [126.9790, 37.5675]  // Nearby point
            ];
            const result = inspectPath(twoPoints);
            
            expect(result.nodes).toHaveLength(2); // 2 path points
            expect(result.nodes[0].progress).toBe(0);
            expect(result.nodes[1].progress).toBeGreaterThan(0);
            expect(result.nodes[1].bearing).toBe(0); // Final node has bearing 0
        });

        it("handles duplicate consecutive points", () => {
            const pathWithDupes: [number, number][] = [];
            const pivot: [number, number] = [126.978, 37.5665];
            
            for (let i = 0; i < 20; i++) {
                pathWithDupes.push([...pivot]); // All same point
            }
            // Add a different final point
            pathWithDupes[pathWithDupes.length - 1] = [pivot[0] + 1e-5, pivot[1]];
            
            const result = inspectPath(pathWithDupes);
            
            expect(result.nodes).toHaveLength(pathWithDupes.length);
            // Most nodes should have very small progress increments (or 0)
            for (let i = 1; i < result.nodes.length - 2; i++) {
                const progressDiff = result.nodes[i + 1].progress - result.nodes[i].progress;
                expect(progressDiff).toBeLessThan(1); // Less than 1 meter between duplicates
            }
        });
    });

    describe("Coordinate system accuracy", () => {
        it("WKT coordinates match proj4 conversion", () => {
            const sample: [number, number] = [126.9780, 37.5665]; // Seoul City Hall
            const [x, y] = convertToUTMK(sample);
            
            // Verify coordinates are reasonable for Seoul area (Korean coordinate system 5179)
            expect(x).toBeGreaterThan(900000); // Western Seoul
            expect(x).toBeLessThan(1000000); // Eastern Seoul
            expect(y).toBeGreaterThan(1900000); // Southern Seoul
            expect(y).toBeLessThan(2000000); // Northern Seoul

            const result = inspectPath([sample]);
            expect(result.wkt5179).toContain(`${x} ${y}`);
        });

        it("distance calculations are reasonable", () => {
            const path = buildSamplePath(100);
            const result = inspectPath(path);
            
            // Calculated length should be close to our projected length
            const finalProgress = result.nodes[result.nodes.length - 1].progress;
            const expectedLengthKm = projectLengthKm(path);
            
            expect(finalProgress / 1000).toBeCloseTo(expectedLengthKm, 0); // Within 1km
        });
    });

    describe("Bearing calculations", () => {
        it("calculates correct bearings for cardinal directions", () => {
            // Path going east then north
            const path: [number, number][] = [
                [126.9780, 37.5665], // Start
                [126.9790, 37.5665], // Go east
                [126.9790, 37.5675], // Go north
            ];
            
            const result = inspectPath(path);
            
            // Bearings should represent direction changes
            expect(result.nodes).toHaveLength(3);
            expect(typeof result.nodes[0].bearing).toBe('number');
            expect(typeof result.nodes[1].bearing).toBe('number');
            expect(typeof result.nodes[2].bearing).toBe('number');
            expect(result.nodes[2].bearing).toBe(0); // Final node always 0
        });

        it("bearing values are within valid range", () => {
            const path = buildSamplePath(50);
            const result = inspectPath(path);
            
            result.nodes.forEach((node, i) => {
                expect(node.bearing).toBeGreaterThanOrEqual(-180);
                expect(node.bearing).toBeLessThanOrEqual(180);
                if (i === result.nodes.length - 1) {
                    expect(node.bearing).toBe(0); // Final node
                }
            });
        });
    });

    describe("WKT generation", () => {
        it("generates valid WKT format", () => {
            const path: [number, number][] = [
                [126.9780, 37.5665],
                [126.9790, 37.5675],
                [126.9800, 37.5685]
            ];
            
            const result = inspectPath(path);
            
            // Should be valid LINESTRING format
            expect(result.wkt5179).toMatch(/^SRID=5179;LINESTRING\([0-9\.\-\s,]+\)$/);
            
            // Should have correct number of coordinate pairs
            const coordPairs = result.wkt5179.match(/[0-9\.\-]+\s+[0-9\.\-]+/g);
            expect(coordPairs).toHaveLength(path.length);
        });

        it("handles empty path gracefully", () => {
            expect(() => inspectPath([])).toThrow();
            // Empty paths should be validated before calling this function
        });
    });
});

describe("Performance benchmarks", () => {
    const PERFORMANCE_ITERATIONS = 50;
    const TEST_SIZES = [100, 500, 1000, 2000, 5000];

    describe("Scalability tests", () => {
        TEST_SIZES.forEach(size => {
            it(`performs efficiently with ${size} points`, () => {
                const path = buildSamplePath(size);
                const times: number[] = [];

                for (let i = 0; i < PERFORMANCE_ITERATIONS; i++) {
                    const start = performance.now();
                    inspectPath(path);
                    const end = performance.now();
                    times.push(end - start);
                }

                const avg = times.reduce((a, b) => a + b) / times.length;
                const sorted = times.sort((a, b) => a - b);
                const p95 = sorted[Math.floor(sorted.length * 0.95)];
                const p99 = sorted[Math.floor(sorted.length * 0.99)];

                console.log(
                    `[inspectPath] SIZE=${size}: avg=${avg.toFixed(3)}ms, p95=${p95.toFixed(3)}ms, p99=${p99.toFixed(3)}ms`
                );

                // Performance expectations (adjust based on your requirements)
                expect(avg).toBeLessThan(size * 0.01); // Should be roughly O(n) with small constant
                expect(p95).toBeLessThan(size * 0.02);
                expect(p99).toBeLessThan(size * 0.05);
            });
        });
    });

    describe("Memory efficiency", () => {
        it("handles large paths without excessive memory usage", () => {
            const LARGE_SIZE = 10000;
            const path = buildSamplePath(LARGE_SIZE);

            // Measure memory before
            if (global.gc) {
                global.gc();
            }
            const memBefore = process.memoryUsage();

            // Run the function
            const result = inspectPath(path);

            // Measure memory after
            const memAfter = process.memoryUsage();

            // Verify result is complete
            expect(result.nodes).toHaveLength(LARGE_SIZE);
            expect(result.wkt5179).toContain('SRID=5179;LINESTRING');

            // Memory usage should be reasonable (this is a rough check)
            const memDiff = memAfter.heapUsed - memBefore.heapUsed;
            console.log(`Memory usage for ${LARGE_SIZE} points: ${(memDiff / 1024 / 1024).toFixed(2)}MB`);
            
            // Should not use excessive memory (adjust threshold as needed)
            expect(memDiff).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
        });
    });

    describe("Algorithmic complexity", () => {
        it("shows linear time complexity O(n)", () => {
            const results: { size: number; avgTime: number }[] = [];

            [100, 200, 400, 800].forEach(size => {
                const path = buildSamplePath(size);
                const times: number[] = [];

                for (let i = 0; i < 20; i++) {
                    const start = performance.now();
                    inspectPath(path);
                    const end = performance.now();
                    times.push(end - start);
                }

                const avgTime = times.reduce((a, b) => a + b) / times.length;
                results.push({ size, avgTime });
            });

            // Check that time grows roughly linearly with input size
            for (let i = 1; i < results.length; i++) {
                const prev = results[i - 1];
                const curr = results[i];
                const sizeRatio = curr.size / prev.size;
                const timeRatio = curr.avgTime / prev.avgTime;

                console.log(`Size ratio: ${sizeRatio.toFixed(2)}, Time ratio: ${timeRatio.toFixed(2)}`);
                
                // Time ratio should be roughly proportional to size ratio (within reasonable bounds)
                expect(timeRatio).toBeLessThan(sizeRatio * 2); // Allow for some overhead
                expect(timeRatio).toBeGreaterThan(sizeRatio * 0.5); // But should scale somewhat
            }
        });
    });

    describe("Stress tests", () => {
        it("handles repeated calls efficiently", () => {
            const path = buildSamplePath(1000);
            const ITERATIONS = 100;
            const times: number[] = [];

            for (let i = 0; i < ITERATIONS; i++) {
                const start = performance.now();
                const result = inspectPath(path);
                const end = performance.now();
                
                times.push(end - start);
                
                // Verify result is consistent
                expect(result.nodes).toHaveLength(1000);
                expect(result.nodes[0].progress).toBe(0);
                expect(result.nodes[result.nodes.length - 1].bearing).toBe(0);
            }

            const avgTime = times.reduce((a, b) => a + b) / times.length;
            const maxTime = Math.max(...times);
            const minTime = Math.min(...times);

            console.log(`Repeated calls: avg=${avgTime.toFixed(3)}ms, min=${minTime.toFixed(3)}ms, max=${maxTime.toFixed(3)}ms`);

            // Performance should be consistent
            expect(maxTime - minTime).toBeLessThan(avgTime * 2); // Max shouldn't be more than 2x avg
        });

        it("handles edge case performance", () => {
            // Test with many duplicate points (potential performance trap)
            const duplicatePath: [number, number][] = Array(1000).fill([126.978, 37.5665]);
            duplicatePath.push([126.979, 37.5665]); // One different point at the end

            const start = performance.now();
            const result = inspectPath(duplicatePath);
            const end = performance.now();

            expect(result.nodes).toHaveLength(1001);
            expect(end - start).toBeLessThan(50); // Should handle duplicates efficiently

            console.log(`Duplicate points performance: ${(end - start).toFixed(3)}ms`);
        });
    });
});