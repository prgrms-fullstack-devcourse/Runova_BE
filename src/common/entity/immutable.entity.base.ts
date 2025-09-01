import { CreateDateColumn } from "typeorm";
import transformer from "../../utils/datetime-transformer";

export class ImmutableEntityBase {
  @CreateDateColumn({ name: "created_at", type: "timestamptz", transformer })
  createdAt: Date;
}
