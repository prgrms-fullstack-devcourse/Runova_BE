import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "../users/user.entity";

export enum OAuthProvider {
  GOOGLE = "GOOGLE",
}

@Entity({ name: "social_accounts" })
@Unique(["provider", "providerUserId"])
export class SocialAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "enum", enum: OAuthProvider, enumName: "oauth_provider" })
  provider: OAuthProvider;

  @Column({ type: "varchar", length: 64 })
  providerUserId: string;

  @ManyToOne(() => User, (u) => u.socialAccounts, { onDelete: "CASCADE" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
