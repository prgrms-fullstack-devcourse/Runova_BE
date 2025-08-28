import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryFailedError } from "typeorm";
import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import { Transactional } from "typeorm-transactional";
import { DatabaseError } from "pg";
import { User } from "../modules/users/user.entity";
import { TokensService } from "./tokens.service";
import { GoogleService } from "./google.service";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshJwtPayload {
  sub: number;
  tokenVersion?: number;
  iat?: number;
  exp?: number;
}

type PublicUser = Pick<User, "id" | "nickname" | "email" | "avatarUrl">;

const PG_UNIQUE_VIOLATION = "23505";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly tokens: TokensService,
    private readonly google: GoogleService
  ) {}

  @Transactional()
  async loginWithGoogle(idToken: string) {
    const {
      sub: providerUserId,
      email,
      name,
      picture,
    } = await this.google.verifyIdToken(idToken).catch((error) => {
      console.error("Google token verify failed:", error);
      throw new UnauthorizedException("Invalid Google ID token");
    });

    let user = await this.userRepo.findOne({ where: { email } });

    if (user) {
      user.providerUserId = providerUserId;
      if (!user.avatarUrl && picture) user.avatarUrl = picture;
      await this.userRepo.save(user);
    } else {
      try {
        user = this.userRepo.create({
          email,
          nickname: name,
          providerUserId,
          avatarUrl: picture,
        });
        await this.userRepo.save(user);
      } catch (error) {
        this.handleUniqueViolation(error);
        throw error;
      }
    }

    const tokenPair = await this.issueTokenPair(user);
    await this.replaceRefresh(user, tokenPair.refreshToken);

    return { ...tokenPair, user: this.toPublicUser(user) };
  }

  @Transactional()
  async rotateRefreshToken(refreshToken: string): Promise<TokenPair> {
    const payload = this.verifyRefresh(refreshToken);
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });

    await this.ensureActiveSession(user);

    // 재사용/위조 탐지
    const isMatch = await argon2
      .verify(user!.refreshTokenHash!, refreshToken)
      .catch(() => false);
    if (!isMatch) {
      await this.revokeAllSessions(user!); // tokenVersion++ + refresh 제거
      throw new ForbiddenException("Token reuse detected");
    }

    const tokenPair = await this.issueTokenPair(user!);
    await this.replaceRefresh(user!, tokenPair.refreshToken);
    return tokenPair;
  }

  /** 단일 단말 로그아웃(리프레시 제거, revokeAll=true면 전 기기 무효화) */
  @Transactional()
  async logout(userId: number, revokeAll = false): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new ForbiddenException("Invalid request");

    if (revokeAll) user.tokenVersion += 1;
    await this.clearRefresh(user);
    await this.userRepo.save(user);
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const accessToken = await this.tokens.signAccessToken(
      user.id,
      user.nickname,
      user.tokenVersion
    );
    const refreshToken = await this.tokens.signRefreshToken(
      user.id,
      user.tokenVersion
    );
    return { accessToken, refreshToken };
  }

  private async replaceRefresh(
    user: User,
    newRefreshToken: string
  ): Promise<void> {
    user.refreshTokenHash = await argon2.hash(newRefreshToken);
    user.refreshExpiresAt = this.calcRefreshExpiry();
    await this.userRepo.save(user);
  }

  private async clearRefresh(user: User): Promise<void> {
    user.refreshTokenHash = null;
    user.refreshExpiresAt = null;
  }

  private async revokeAllSessions(user: User): Promise<void> {
    user.tokenVersion += 1;
    await this.clearRefresh(user);
    await this.userRepo.save(user);
  }

  private async ensureActiveSession(
    user: User | null | undefined
  ): Promise<void> {
    if (!user || !user.refreshTokenHash || !user.refreshExpiresAt) {
      throw new ForbiddenException("Invalid session");
    }
    if (user.refreshExpiresAt < new Date()) {
      user.refreshTokenHash = null;
      user.refreshExpiresAt = null;
      await this.userRepo.save(user); // ← await
      throw new ForbiddenException("Session expired");
    }
  }

  private calcRefreshExpiry(): Date {
    return new Date(Date.now() + this.refreshTokenTtlMs());
  }

  private refreshTokenTtlMs(): number {
    return 14 * 24 * 60 * 60 * 1000; // 14d
  }

  private verifyRefresh(token: string): RefreshJwtPayload {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
      if (typeof payload === "string" || !payload) {
        throw new UnauthorizedException("Invalid refresh token");
      }
      const { sub, tokenVersion, iat, exp } = payload as jwt.JwtPayload;
      if (!sub) throw new UnauthorizedException("Invalid refresh token");
      return {
        sub: Number(sub),
        tokenVersion,
        iat,
        exp,
      };
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private handleUniqueViolation(error: unknown): void | never {
    if (error instanceof QueryFailedError) {
      const pgError = error.driverError as DatabaseError | undefined;
      if (pgError?.code === PG_UNIQUE_VIOLATION) {
        const constraintName = pgError.constraint ?? "";
        if (constraintName.includes("nickname")) {
          throw new ConflictException("Nickname already taken");
        }
        if (constraintName.includes("email")) {
          throw new ConflictException("Email already in use");
        }
        if (constraintName.includes("providerUserId")) {
          throw new ConflictException("Account already linked");
        }
        throw new ConflictException("Duplicate key");
      }
    }
  }
}
