import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "../users/user.entity";

export type OAuthProvider = "GOOGLE";

@Entity({ name: "social_accounts" })
@Unique(["provider", "providerUserId"])
export class SocialAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 16 })
  provider: OAuthProvider; // 'GOOGLE'

  @Column({ type: "varchar", length: 128 })
  providerUserId: string; // Google sub

  @Column({ type: "varchar", length: 320, nullable: true })
  email?: string;

  @ManyToOne(() => User, (u) => u.socialAccounts, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
