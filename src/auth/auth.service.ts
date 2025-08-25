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

import { User } from "../modules/users/user.entity";
import { TokensService } from "./tokens.service";
import { GoogleService } from "./google.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly tokensService: TokensService,
    private readonly googleService: GoogleService
  ) {}

  @Transactional()
  async loginWithGoogle(idToken: string) {
    const { sub, email, name, picture } = await this.googleService
      .verifyIdToken(idToken)
      .catch(() => {
        throw new UnauthorizedException("Invalid Google ID token");
      });

    const safeEmail = email ?? `${sub}@google.local`;
    const desiredNickname = (name || email?.split("@")[0] || "runner")
      .replace(/\s+/g, "")
      .slice(0, 20);

    let user = await this.usersRepo.findOne({ where: { providerUserId: sub } });

    if (!user) {
      user = await this.usersRepo.findOne({ where: { email: safeEmail } });

      if (user) {
        user.providerUserId = sub;
        if (!user.avatarUrl && picture) user.avatarUrl = picture;
        await this.usersRepo.save(user);
      } else {
        try {
          user = this.usersRepo.create({
            email: safeEmail,
            nickname: desiredNickname,
            providerUserId: sub,
            avatarUrl: picture,
          });
          await this.usersRepo.save(user);
        } catch (e) {
          if (e instanceof QueryFailedError && (e as any).code === "23505") {
            const cons = (e as any).driverError?.constraint as
              | string
              | undefined;
            if (cons?.includes("nickname"))
              throw new ConflictException("Nickname already taken");
            if (cons?.includes("email"))
              throw new ConflictException("Email already in use");
            if (cons?.includes("providerUserId"))
              throw new ConflictException("Account already linked");
          }
          throw e;
        }
      }
    }

    const accessToken = await this.tokensService.signAccessToken(
      user.id,
      user.nickname,
      user.tokenVersion // 버전
    );

    const refreshToken = await this.tokensService.signRefreshToken(
      user.id,
      user.tokenVersion // 세션 대신 버전만 포함
    );

    user.refreshTokenHash = await argon2.hash(refreshToken);
    user.refreshExpiresAt = new Date(Date.now() + this.refreshTtlMs());
    await this.usersRepo.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  @Transactional()
  async rotateRefreshToken(refreshToken: string) {
    const payload = this.verifyRefresh(refreshToken);
    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });

    if (!user || !user.refreshTokenHash || !user.refreshExpiresAt) {
      throw new ForbiddenException("Invalid session");
    }
    if (user.refreshExpiresAt < new Date()) {
      user.refreshTokenHash = null;
      user.refreshExpiresAt = null;
      await this.usersRepo.save(user);
      throw new ForbiddenException("Session expired");
    }

    // 재사용/위조 탐지
    const ok = await argon2
      .verify(user.refreshTokenHash, refreshToken)
      .catch(() => false);
    if (!ok) {
      // 탈취 의심: 모든 토큰 무효화
      user.tokenVersion += 1; // Access 토큰의 v와 불일치시 가드에서 차단 가능
      user.refreshTokenHash = null;
      user.refreshExpiresAt = null;
      await this.usersRepo.save(user);
      throw new ForbiddenException("Token reuse detected");
    }

    // 회전: 새 RT/AT 발급 + 해시 교체
    const newRefresh = await this.tokensService.signRefreshToken(
      user.id,
      user.tokenVersion
    );
    const newAccess = await this.tokensService.signAccessToken(
      user.id,
      user.nickname,
      user.tokenVersion
    );

    user.refreshTokenHash = await argon2.hash(newRefresh);
    user.refreshExpiresAt = new Date(Date.now() + this.refreshTtlMs());
    await this.usersRepo.save(user);

    return { accessToken: newAccess, refreshToken: newRefresh };
  }

  /** 단일 단말 로그아웃(리프레시 제거, 필요시 버전 증가해 액세스도 무효화) */
  @Transactional()
  async logout(userId: number, revokeAll = false) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) return;

    user.refreshTokenHash = null;
    user.refreshExpiresAt = null;
    if (revokeAll) user.tokenVersion += 1;
    await this.usersRepo.save(user);
  }

  private refreshTtlMs() {
    return 14 * 24 * 60 * 60 * 1000; // 14d
  }

  private verifyRefresh(token: string): { sub: number; v?: number } {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
