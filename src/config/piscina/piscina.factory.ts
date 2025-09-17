import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Piscina from "piscina";
import { isAbsolute } from "node:path";

@Injectable()
export class PiscinaFactory implements OnModuleDestroy {
    private readonly pools: Map<string, Piscina> = new Map<string, Piscina>();

    async onModuleDestroy(): Promise<void> {
        for (const pool of this.pools.values())
            await pool.close({ force: true });
    }

    getInstance<T, R>(workerPath: string): Piscina<T, R> {

        if (!isAbsolute(workerPath))
            throw Error("path should be absolute");

        if (!this.pools.has(workerPath)) {
            const pool = new Piscina<T, R>({ filename: workerPath });
            this.pools.set(workerPath, pool);
        }

        return this.pools.get(workerPath)! as Piscina<T, R>;
    }
}