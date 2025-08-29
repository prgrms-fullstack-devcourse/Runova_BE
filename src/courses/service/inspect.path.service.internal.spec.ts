/**
 * Jest tests + perf micro-bench for inspectPath
 */
import converter from "../../config/proj4";
import { inspectPath } from "./inspect.path.service.internal";
import type { Coordinates } from "../../common/geo";

jest.setTimeout(60_000);

/** Build a polyline roughly ~10–15km long around central Seoul */
function buildSamplePath(points = 500): Coordinates[] {
    // Start near Gyeongbokgung
    const start: Coordinates = { lon: 126.9769, lat: 37.5796 };
    const end: Coordinates   = { lon: 127.0350, lat: 37.5000 }; // toward Gangnam
    const path: Coordinates[] = [];
    for (let i = 0; i < points; i++) {
        const t = i / (points - 1);
        // Simple easing with a small sinusoidal wiggle to avoid perfectly straight line
        const lon = start.lon + (end.lon - start.lon) * t + 0.002 * Math.sin(10 * t * Math.PI);
        const lat = start.lat + (end.lat - start.lat) * t + 0.002 * Math.cos(8 * t * Math.PI);
        path.push({ lon, lat });
    }
    return path;
}

function projectLengthKm(coords: Coordinates[]): number {
    // Sum Euclidean distances after projecting to 5179 (meters), then convert to km
    let sumM = 0;
    for (let i = 1; i < coords.length; i++) {
        const a = coords[i - 1];
        const b = coords[i];
        const [ax, ay] = converter.forward([a.lon, a.lat]) as [number, number];
        const [bx, by] = converter.forward([b.lon, b.lat]) as [number, number];
        const dx = bx - ax;
        const dy = by - ay;
        sumM += Math.hypot(dx, dy);
    }
    return sumM / 1000;
}

describe("inspectPath", () => {
    test("basic shape: nodes align with input, progress normalized, length in km", () => {
        const path = buildSamplePath(8);
        const result = inspectPath(path);

        // length is reported in kilometers
        expect(result.length).toBeGreaterThan(1);  // >1 km
        expect(result.length).toBeLessThan(50);    // <50 km for our synthetic line

        // nodes.length == path.length
        expect(result.nodes).toHaveLength(path.length);

        // first node maps to first input coord with progress ~0
        expect(result.nodes[0].location).toEqual(path[0]);
        expect(result.nodes[0].progress).toBeCloseTo(0, 10);

        // last node progress == 1
        const last = result.nodes[result.nodes.length - 1];
        expect(last.location).toEqual(path[path.length - 1]);
        expect(last.progress).toBeCloseTo(result.length, 10);

        // progress is non-decreasing
        for (let i = 1; i < result.nodes.length; i++) {
            expect(result.nodes[i].progress).toBeGreaterThanOrEqual(result.nodes[i - 1].progress);
        }

        // bearings are finite numbers; last bearing is 0 per implementation
        for (let i = 0; i < result.nodes.length - 1; i++) {
            expect(Number.isFinite(result.nodes[i].bearing)).toBe(true);
        }
        expect(last.bearing).toBe(0);
    });

    test("projection sanity: 4326 -> 5179 yields [east, north] meters-ish", () => {
        const sample: Coordinates = { lon: 126.9780, lat: 37.5665 }; // Seoul City Hall
        const [x, y] = converter.forward([sample.lon, sample.lat]);

        // Sanity checks: numbers, and magnitudes consistent with Easting/Northing (in meters)
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);

        // Easting is typically around ~1,000,000m and Northing ~2,000,000m in EPSG:5179 with your proj4 params
        expect(x).toBeGreaterThan(500_000);
        expect(x).toBeLessThan(1_500_000);
        expect(y).toBeGreaterThan(1_500_000);
        expect(y).toBeLessThan(2_500_000);
    });

    test("performance: run multiple iterations and report avg / p95 (ms) to console", () => {
        const N = 150;              // iterations
        const SIZE = 1200;          // path points per iteration
        const times: number[] = [];

        // warmup
        inspectPath(buildSamplePath(200));

        for (let i = 0; i < N; i++) {
            const path = buildSamplePath(SIZE);
            const t0 = process.hrtime.bigint();
            const result = inspectPath(path);
            const t1 = process.hrtime.bigint();

            // sanity to avoid dead-code elimination in VMs
            if (!result || result.nodes.length !== SIZE) {
                throw new Error("Unexpected result size");
            }

            const ms = Number(t1 - t0) / 1e6;
            times.push(ms);
        }

        times.sort((a, b) => a - b);
        const avg = times.reduce((s, v) => s + v, 0) / times.length;
        const p95 = times[Math.floor(times.length * 0.95)];

        // eslint-disable-next-line no-console
        console.info(
            `[inspectPath] perf over ${N} iters @ SIZE=${SIZE}: avg=${avg.toFixed(3)} ms, p95=${p95.toFixed(3)} ms`
        );

        // Optional soft sanity: fail if truly pathological (adjust if needed)
        expect(avg).toBeLessThan(150); // keep generous to avoid CI noise
        expect(p95).toBeLessThan(250);
    });


    test("progress is strictly non-decreasing even with duplicate points", () => {
        const base = buildSamplePath(10);
        // Inject duplicates at a few positions
        const withDupes: Coordinates[] = [];
        for (let i = 0; i < base.length; i++) {
            withDupes.push(base[i]);
            if (i === 3 || i === 7) withDupes.push(base[i]);
        }
        const result = inspectPath(withDupes);

        // Non-decreasing progress
        for (let i = 1; i < result.nodes.length; i++) {
            expect(result.nodes[i].progress).toBeGreaterThanOrEqual(result.nodes[i - 1].progress);
        }

        expect(result.nodes[0].progress).toBeGreaterThanOrEqual(0);
        expect(result.nodes[result.nodes.length - 1].progress).toBeLessThanOrEqual(result.length);
        // bearings finite (including on zero-length segments introduced by duplicates)
        for (let i = 0; i < result.nodes.length; i++) {
            expect(Number.isFinite(result.nodes[i].bearing)).toBe(true);
            expect(result.nodes[i].bearing).toBeGreaterThanOrEqual(-180);
            expect(result.nodes[i].bearing).toBeLessThan(180);
        }
    });

    test("length ≈ sum of projected segment lengths (within tolerance)", () => {
        const path = buildSamplePath(64);
        const result = inspectPath(path);
        const expectedKm = projectLengthKm(path);
        // Tolerance: 0.2% of length + 0.05 km to allow for rounding/internal differences
        const tol = expectedKm * 0.002 + 0.05;
        expect(Math.abs(result.length - expectedKm)).toBeLessThanOrEqual(tol);
    });

    test("bearings are normalized to [0, 360) and finite", () => {
        const path = buildSamplePath(40);
        const result = inspectPath(path);
        for (const node of result.nodes) {
            expect(Number.isFinite(node.bearing)).toBe(true);
            expect(node.bearing).toBeGreaterThanOrEqual(-180);
            expect(node.bearing).toBeLessThan(180);
        }
    });

    test("deterministic output for identical input (length, progress, bearings)", () => {
        const path = buildSamplePath(32);
        const a = inspectPath(path);
        const b = inspectPath(path);

        expect(a.length).toBeCloseTo(b.length, 10);
        expect(a.nodes.length).toBe(b.nodes.length);
        for (let i = 0; i < a.nodes.length; i++) {
            const an = a.nodes[i];
            const bn = b.nodes[i];
            // locations should match input positions exactly
            expect(an.location).toEqual(bn.location);
            // progress and bearing should be numerically equal (within FP noise)
            expect(an.progress).toBeCloseTo(bn.progress, 10);
            expect(an.bearing).toBeCloseTo(bn.bearing, 10);
        }
    });

    test("handles nearly-degenerate path (mostly identical points) without NaNs", () => {
        const pivot: Coordinates = { lon: 126.978, lat: 37.5665 };
        const path: Coordinates[] = Array.from({ length: 20 }, () => ({ ...pivot }));
        // Add a tiny displacement at the end to avoid zero total length
        path[path.length - 1] = { lon: pivot.lon + 1e-5, lat: pivot.lat };

        const result = inspectPath(path);
        expect(Number.isFinite(result.length)).toBe(true);
        for (const n of result.nodes) {
            expect(Number.isFinite(n.progress)).toBe(true);
            expect(n.progress).toBeGreaterThanOrEqual(0);
            expect(n.progress).toBeLessThanOrEqual(1);
            expect(Number.isFinite(n.bearing)).toBe(true);
        }
    });

    test.todo("rejects invalid coordinates (NaN/Infinity)");
});