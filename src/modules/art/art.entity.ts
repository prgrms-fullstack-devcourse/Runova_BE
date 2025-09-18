import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EntityBase } from "../../common/entity";

@Entity("arts")
export class Art extends EntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "boolean", default: false })
    prepared: boolean;

    @Column({ name: "image_url", type: "varchar", nullable: true })
    imageUrl: string ;
}