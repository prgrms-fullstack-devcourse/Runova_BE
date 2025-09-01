import { CreateDateColumn, UpdateDateColumn } from "typeorm";
import transformer from "../../utils/datetime-transformer";
import { LocalDateTime } from "@js-joda/core";

export abstract class EntityBase {
  @CreateDateColumn({ name: "created_at", type: "timestamptz", transformer })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz", transformer })
  updatedAt: Date;
}
