import { CreateDateColumn } from "typeorm";

export class ImmutableEntityBase {
    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt: Date;
}
