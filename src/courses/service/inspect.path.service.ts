import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { InspectPathResult } from "../dto";
import { resolve } from "node:path";
import Piscina, { move } from "piscina";

@Injectable()
export class InspectPathService implements OnModuleDestroy {
    private readonly piscina: Piscina<Float32Array, InspectPathResult>;

    constructor() {
        this.piscina = new Piscina({
            filename: resolve(__dirname, "../worker/inspect.path.worker.js"),
        });
    }

    async onModuleDestroy(): Promise<void> {
        await this.piscina.close({ force: true });
    }

    async inspectPath(path: [number, number][]): Promise<InspectPathResult> {
        return await this.piscina.run(
            move(Float32Array.from(path.flat())) as Float32Array,
        );
    }
}

