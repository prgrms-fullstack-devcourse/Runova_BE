import { CreateDateColumn } from "typeorm";
import transformer from "./local.datetime.transformer";
import { LocalDateTime } from "@js-joda/core";

/**
 * Base model class for table which does not allow modifying, so doesn't have a updated_at column
 */
export abstract class ImmutableModelBase {
    @CreateDateColumn({ name: "created_at", type: "timestamp", transformer })
    createdAt: LocalDateTime;
}