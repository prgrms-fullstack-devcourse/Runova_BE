import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";

@Entity({ name: "user_sessions" })
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.sessions, { onDelete: "CASCADE" })
  user: User;

  @Column({ type: "text" })
  refreshTokenHash: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  deviceInfo?: string;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip?: string;

  @Column({ type: "timestamptz" })
  expiresAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  revokedAt?: Date;

  @Index()
  @Column({ type: "timestamptz", nullable: true })
  lastUsedAt?: Date;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
