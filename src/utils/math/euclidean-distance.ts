import { applyOp } from "./apply-op";
import { norm2 } from "./norm2";

export function euclideanDistance(
    r1: number[],
    r2: number[],
): number {

   const dr = applyOp(
       r2, r1,
       (x2, x1) => x2 - x1
   );

   return norm2(dr);
}