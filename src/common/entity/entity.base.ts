import { CreateDateColumn, UpdateDateColumn } from "typeorm";
import transformer from "../../utils/datetime-transformer";
import { LocalDateTime } from "@js-joda/core";


export abstract class EntityBase {
    @CreateDateColumn({ name: "created_at", type: "timestamp", transformer })
    createdAt: LocalDateTime;

    @UpdateDateColumn({ name: "updated_at", type: "timestamp", transformer })
    updatedAt: LocalDateTime;
}

