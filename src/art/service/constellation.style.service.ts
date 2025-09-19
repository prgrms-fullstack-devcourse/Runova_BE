import { Injectable, OnModuleInit } from "@nestjs/common";
import { ArtStyle } from "../style";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { deepFreeze } from "../../utils/object";

@Injectable()
export class ConstellationStyleService implements OnModuleInit {
  private style: ArtStyle;

  async onModuleInit(): Promise<void> {

    const raw: string = await readFile(
      resolve(__dirname, "../../../constellation-style.json"),
      "utf8",
    );

    this.style = JSON.parse(raw);
    deepFreeze(this.style);
  }

  get(): Readonly<ArtStyle> {
    return this.style;
  }
}