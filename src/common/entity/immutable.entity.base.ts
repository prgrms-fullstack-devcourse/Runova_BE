import { CreateDateColumn } from "typeorm";
import transformer from "./local.datetime.transformer";
import { LocalDateTime } from "@js-joda/core";

export class ImmutableEntityBase {
    @CreateDateColumn({ name: "created_at", type: "timestamp", transformer })
    createdAt: LocalDateTime;
}

