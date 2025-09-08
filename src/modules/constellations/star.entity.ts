import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ImmutableEntityBase } from "../../common/entity";
import { Constellation } from "./constellation.entity";
import { PointColumn } from "../../common/geo";

@Entity("stars")
export class Star extends ImmutableEntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ name: "constellation_id", type: "int" })
    constellationId: number;

    @ManyToOne(() =>Constellation, { onDelete: "CASCADE" })
    @JoinColumn({ name: "constellation_id" })
    constellation: Constellation;

    @PointColumn()
    location: [number, number];

    @Column({ type: "float8" })
    progress: number;

    @Column({ type: "float8" })
    bearing: number;
}