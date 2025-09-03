import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  Index
} from "typeorm";
import { EntityBase } from "../../common/entity";

@Entity({ name: "users" })
@Unique("UQ_users_email", ["email"])
@Unique("UQ_users_nickname", ["nickname"])
@Unique("UQ_users_providerUserId", ["providerUserId"])
export class User extends EntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 320, nullable: false })
  email: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  nickname: string;

  @Column({ type: "varchar", length: 64, nullable: false })
  providerUserId: string;

  @Column({ type: "varchar", length: 512, nullable: true })
  avatarUrl?: string;

  @Column({ type: "text", nullable: true, default: null })
  refreshTokenHash: string | null;

  @Index()
  @Column({ type: "timestamptz", nullable: true, default: null })
  refreshExpiresAt: Date | null;

  // 토큰 무효화 고려: 강제 로그아웃/재사용 탐지 시 증가
  @Index()
  @Column({ type: "int", default: 0 })
  tokenVersion: number;
}
