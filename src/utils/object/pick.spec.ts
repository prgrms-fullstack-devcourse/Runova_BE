import { pick } from "./pick";

describe("pick", () => {

    it.each(
        [10, 100, 1_000, 10_000, 100_000]
    )('Check correctness and performance of pick', length => {

        const keys = Array.from(
            { length },
            (_, i) => `key_${i}`
        );

        const targets = keys.filter((_, i) => i % 2 === 0);

        const obj =  Object.fromEntries(
            keys.map(k => [k, Math.random()])
        );

        const start = performance.now();
        const result = pick(obj, targets);
        const end = performance.now();

        targets.forEach(tg =>
            expect(result).toHaveProperty(tg)
        );

        console.log(`omit took ${end - start}ms for ${length} keys`);
    });
})