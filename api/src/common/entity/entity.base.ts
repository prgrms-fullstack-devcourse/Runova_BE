import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class EntityBase {
    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz", })
    updatedAt: Date;
}
