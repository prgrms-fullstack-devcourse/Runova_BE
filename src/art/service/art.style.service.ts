import { Injectable, OnModuleInit } from "@nestjs/common";
import { ArtStyle, Layout, LineStyle, SimplificationOptions, StarStyle } from "../style";
import { readFile } from "node:fs/promises";
import { resolve } from "path";
import { deepFreeze } from "../../utils/object";

@Injectable()
export class ArtStyleService implements ArtStyle, OnModuleInit {
    public readonly layout: Layout;
    public readonly lineStyle: LineStyle;
    public readonly starStyle: StarStyle;
    public readonly simplificationOptions: SimplificationOptions;
    public readonly format: "png" | "svg";

    async onModuleInit(): Promise<void> {

        const raw: string = await readFile(
            resolve(__dirname, "../../../constellation-style.json"),
            "utf8",
        );

        Object.assign(this, JSON.parse(raw) as ArtStyle);
        deepFreeze(this);
    }
}