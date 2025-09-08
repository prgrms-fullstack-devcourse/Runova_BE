import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ImmutableEntityBase } from "../../common/entity";
import { Constellation } from "./constellation.entity";
import { User } from "../users";

@Entity("constellation_likes")
@Unique(["constellationId", "userId"])
export class ConstellationLike extends ImmutableEntityBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ name: "constellation_id", type: "int" })
    constellationId: number;

    @ManyToOne(() =>Constellation, { onDelete: "CASCADE" })
    @JoinColumn({ name: "constellation_id" })
    constellation: Constellation;

    @Index()
    @Column({ name: "user_id", type: "int" })
    userId: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;
}