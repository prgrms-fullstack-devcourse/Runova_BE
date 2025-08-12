import { omit } from "./omit";

describe("omit", () => {

    it.each(
        [10, 100, 1_000, 10_000, 100_000]
    )('Check correctness and performance of omit', length => {

        const keys = Array.from(
            { length },
            (_, i) => `key_${i}`
        );

        const targets = keys.filter((_, i) => i % 2 === 0);

        const obj =  Object.fromEntries(
            keys.map(k => [k, Math.random()])
        );

        const start = performance.now();
        const result = omit(obj, targets);
        const end = performance.now();

        targets.forEach(tg =>
            expect(result).not.toHaveProperty(tg)
        );

        console.log(`omit took ${end - start}ms for ${length} keys`);
    });
});