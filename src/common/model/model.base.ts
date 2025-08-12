import { CreateDateColumn, UpdateDateColumn } from "typeorm";
import transformer from "./local.datetime.transformer";
import { LocalDateTime } from "@js-joda/core";


export abstract class ModelBase {
    @CreateDateColumn({ name: "created_at", type: "timestamp", transformer })
    createdAt: LocalDateTime;

    @UpdateDateColumn({ name: "updated_at", type: "timestamp", transformer })
    updatedAt: LocalDateTime;
}

