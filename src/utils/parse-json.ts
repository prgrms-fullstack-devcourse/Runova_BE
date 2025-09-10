import { Logger } from "@nestjs/common";

export function parseJSON<T = any>(raw: string): T | undefined {
    try {
        return JSON.parse(raw) as T;
    }
    catch (err) {
        Logger.error(err, "parseJSON");
        return undefined;
    }
}