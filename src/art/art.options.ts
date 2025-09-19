import { ArtStyle } from "./style";
import { Injectable } from "@nestjs/common";
import { readFileSync } from "node:fs";
import { resolve } from "path";
import { deepFreeze } from "../utils/object";

@Injectable()
export class ArtOptions {
    readonly format: "png" | "svg";
    readonly style: ArtStyle;

    constructor() {

        const raw = readFileSync(
            resolve(__dirname, "../../art-config.json"),
            "utf8"
        );

        Object.assign(this, JSON.parse(raw));
        deepFreeze(this.style);
    }
}