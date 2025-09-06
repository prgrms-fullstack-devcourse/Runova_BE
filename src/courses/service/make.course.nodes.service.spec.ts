import { MakeCourseNodesService } from "./make.course.nodes.service";
import { Test } from "@nestjs/testing";
import { WORKER_POOL } from "../../config/workerpool";
import { Line, Position } from "../../common/geometry";
import converter from "../../common/geometry/converter";

interface Coordinates { lon: number; lat: number; }

/** Build a polyline roughly ~10–15km long around central Seoul */
function buildSamplePath(points = 500): Line {
    const start: Position = [126.9769, 37.5796]; // Gyeongbokgung
    const end: Position   = [127.0350, 37.5000]; // Gangnam
    const path: Line = [];

    for (let i = 0; i < points; i++) {
        const t = i / (points - 1);
        // Simple easing with a small sinusoidal wiggle to avoid perfectly straight line
        const lon = start[0] + (end[0] - start[0]) * t + 0.002 * Math.sin(10 * t * Math.PI);
        const lat = start[1] + (end[1] - start[1]) * t + 0.002 * Math.cos(8 * t * Math.PI);
        path.push([lon, lat]);
    }

    return path;
}

function projectLengthKm(coords: Line): number {
    let sumM = 0;

    for (let i = 1; i < coords.length; i++) {
        const a = coords[i - 1];
        const b = coords[i];

        const [ax, ay] = converter.forward(a);
        const [bx, by] = converter.forward(b);

        const dx = bx - ax;
        const dy = by - ay;

        sumM += Math.hypot(dx, dy);
    }
    return sumM;
}


describe(MakeCourseNodesService.name, () => {
    let service: MakeCourseNodesService;

    beforeEach(async () => {

        const module = await Test
            .createTestingModule({
                providers: [
                    {
                        provide: WORKER_POOL,
                        useValue: {
                            async exec<F extends (...args: any[]) => any>(
                                f: F, params: Parameters<F>
                            ): Promise<ReturnType<F>> {
                                return f(...params);
                            }
                        }
                    },
                    MakeCourseNodesService
                ]
            })
            .compile();

        service = module.get(MakeCourseNodesService);
    });

    test("basic shape: nodes align with input, progress normalized, length in km", async () => {
        const path = buildSamplePath(8);
        const nodes = await service.makeCourseNodes(path);

        // nodes.length == path.length (one per segment + final node)
        expect(nodes).toHaveLength(path.length);

        // length is reported in meters
        expect(nodes[7].progress).toBeGreaterThan(1000);  // >1 m
        expect(nodes[7].progress).toBeLessThan(50_000);    // <50 m for our synthetic line

        // first node maps to first input coord with progress ~0
        expect(nodes[0].location).toEqual(path[0]);
        expect(nodes[0].progress).toBeCloseTo(0, 10);

        // last node progress == total length
        const last = nodes[nodes.length - 1];
        expect(last.location).toEqual(path[path.length - 1]);
        expect(last.progress).toBeGreaterThan(nodes[0].progress);

        // progress is non-decreasing
        for (let i = 1; i < nodes.length; i++) {
            expect(nodes[i].progress).toBeGreaterThanOrEqual(nodes[i - 1].progress);
        }

        // bearings are finite numbers; last bearing is 0 per implementation
        for (let i = 0; i < nodes.length - 1; i++) {
            expect(Number.isFinite(nodes[i].bearing)).toBe(true);
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

    test("performance: run multiple iterations and report avg / p95 (ms) to console", async () => {
        const N = 150;              // iterations
        const SIZE = 1200;          // path points per iteration
        const times: number[] = [];

        // warmup
        await service.makeCourseNodes(buildSamplePath(200));

        for (let i = 0; i < N; i++) {
            const path = buildSamplePath(SIZE);
            const t0 = process.hrtime.bigint();
            const result = await service.makeCourseNodes(path);
            const t1 = process.hrtime.bigint();

            // sanity to avoid dead-code elimination in VMs
            if (!result || result.length !== SIZE) {
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
            `[makeCourseNodes] perf over ${N} iters @ SIZE=${SIZE}: avg=${avg.toFixed(3)} ms, p95=${p95.toFixed(3)} ms`
        );

        // Optional soft sanity: fail if truly pathological (adjust if needed)
        expect(avg).toBeLessThan(150); // keep generous to avoid CI noise
        expect(p95).toBeLessThan(250);
    });


    test("progress is strictly non-decreasing even with duplicate points", async () => {
        const base = buildSamplePath(10);
        // Inject duplicates at a few positions
        const withDupes: Position[] = [];
        for (let i = 0; i < base.length; i++) {
            withDupes.push(base[i]);
            if (i === 3 || i === 7) withDupes.push(base[i]);
        }
        const result = await service.makeCourseNodes(withDupes);

        // Non-decreasing progress
        for (let i = 1; i < result.length; i++) {
            expect(result[i].progress).toBeGreaterThanOrEqual(result[i - 1].progress);
        }

        expect(result[0].progress).toBeGreaterThanOrEqual(0);
        const totalLength = result[result.length - 1].progress;
        expect(totalLength).toBeGreaterThanOrEqual(0);
        // bearings finite (including on zero-length segments introduced by duplicates)
        for (let i = 0; i < result.length; i++) {
            expect(Number.isFinite(result[i].bearing)).toBe(true);
            expect(result[i].bearing).toBeGreaterThanOrEqual(-180);
            expect(result[i].bearing).toBeLessThan(180);
        }
    });

    test("length ≈ sum of projected segment lengths (within tolerance)", async () => {
        const path = buildSamplePath(64);
        const result = await service.makeCourseNodes(path);
        const expectedM = projectLengthKm(path);
        const totalLength = result[result.length - 1].progress;
        // Tolerance: 0.2% of length + 50m to allow for rounding/internal differences
        const tol = expectedM * 0.002 + 50;
        expect(Math.abs(totalLength - expectedM)).toBeLessThanOrEqual(tol);
    });

    test("bearings are normalized to [-180, 180) and finite", async () => {
        const path = buildSamplePath(40);
        const result = await service.makeCourseNodes(path);
        for (const node of result) {
            expect(Number.isFinite(node.bearing)).toBe(true);
            expect(node.bearing).toBeGreaterThanOrEqual(-180);
            expect(node.bearing).toBeLessThan(180);
        }
    });

    test("deterministic output for identical input (length, progress, bearings)", async () => {
        const path = buildSamplePath(32);
        const a = await service.makeCourseNodes(path);
        const b = await service.makeCourseNodes(path);

        const aLength = a[a.length - 1].progress;
        const bLength = b[b.length - 1].progress;
        expect(aLength).toBeCloseTo(bLength, 10);
        expect(a.length).toBe(b.length);
        for (let i = 0; i < a.length; i++) {
            const an = a[i];
            const bn = b[i];
            // locations should match input positions exactly
            expect(an.location).toEqual(bn.location);
            // progress and bearing should be numerically equal (within FP noise)
            expect(an.progress).toBeCloseTo(bn.progress, 10);
            expect(an.bearing).toBeCloseTo(bn.bearing, 10);
        }
    });

    test("handles nearly-degenerate path (mostly identical points) without NaNs", async () => {
        const pivot: Position = [126.978, 37.5665];
        const path: Position[] = Array.from({ length: 20 }, () => [...pivot] as Position);
        // Add a tiny displacement at the end to avoid zero total length
        path[path.length - 1] = [pivot[0] + 1e-5, pivot[1]];

        const result = await service.makeCourseNodes(path);
        const totalLength = result[result.length - 1].progress;
        expect(Number.isFinite(totalLength)).toBe(true);
        for (const n of result) {
            expect(Number.isFinite(n.progress)).toBe(true);
            expect(n.progress).toBeGreaterThanOrEqual(0);
            expect(n.progress).toBeLessThanOrEqual(totalLength);
            expect(Number.isFinite(n.bearing)).toBe(true);
        }
    });

    test.todo("rejects invalid coordinates (NaN/Infinity)");


})