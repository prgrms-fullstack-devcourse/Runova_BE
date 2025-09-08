import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EntityBase } from "../../common/entity";
import { User } from "../users";
import { PointColumn, PolygonColumn } from "../../common/geo";
import { Star } from "./star.entity";

@Entity("constellations")
export class Constellation extends EntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ name: "user_id", type: "int" })
    userId: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ type: "varchar" })
    title: string;

    @Column({ type: "text", array: true, default: () => `'{}'` })
    tags: string[];

    @Column({ name: "image_url", type: "varchar" })
    imageUrl: string;

    @Index({ spatial: true })
    @PointColumn()
    head: [number, number];

    @PolygonColumn()
    shape: [number, number][][];

    @OneToMany(() => Star, s => s.constellation)
    stars: Star[];
}