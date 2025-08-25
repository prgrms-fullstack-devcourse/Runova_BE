import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";

import { User } from "../modules/users/user.entity";
import {
  OAuthProvider,
  SocialAccount,
} from "../modules/auth/social-account.entity";
import { UserSession } from "../modules/auth/user-session.entity";
import { TokensService } from "./tokens.service";
import { GoogleService } from "./google.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(SocialAccount)
    private readonly socialRepo: Repository<SocialAccount>,
    @InjectRepository(UserSession)
    private readonly sessionsRepo: Repository<UserSession>,
    private readonly tokensService: TokensService,
    private readonly googleService: GoogleService
  ) {}

  async loginWithGoogle(idToken: string, deviceInfo?: string, ip?: string) {
    const { sub, email, name, picture } = await this.googleService
      .verifyIdToken(idToken)
      .catch(() => {
        throw new UnauthorizedException("Invalid Google ID token");
      });

    let social = await this.socialRepo.findOne({
      where: { provider: OAuthProvider.GOOGLE, providerUserId: sub },
      relations: ["user"],
    });

    if (!social) {
      const safeEmail = email ?? `${sub}@google.local`;
      const desiredNickname = (name || email?.split("@")[0] || "runner")
        .replace(/\s+/g, "")
        .slice(0, 20);

      let user: User;
      try {
        user = this.usersRepo.create({
          email: safeEmail,
          nickname: desiredNickname,
          avatarUrl: picture,
        });
        await this.usersRepo.save(user);
      } catch (e) {
        if (e instanceof QueryFailedError && (e as any).code === "23505") {
          const drv: any = (e as any).driverError ?? {};
          const constraint: string | undefined = drv.constraint;
          const detail: string | undefined = drv.detail;

          const isNickname =
            constraint?.includes("nickname") || detail?.includes("(nickname)");
          const isEmail =
            constraint?.includes("email") || detail?.includes("(email)");

          if (isNickname) throw new ConflictException("Nickname already taken");
          if (isEmail) throw new ConflictException("Email already in use");
        }
        throw e;
      }

      social = this.socialRepo.create({
        provider: OAuthProvider.GOOGLE,
        providerUserId: sub,
        email: email ?? undefined,
        user,
      });
      await this.socialRepo.save(social);
    }

    const user = social.user;

    const session = this.sessionsRepo.create({
      user,
      deviceInfo,
      ip,
      expiresAt: new Date(Date.now() + this.refreshTtlMs()),
    });
    await this.sessionsRepo.save(session);

    const accessToken = await this.tokensService.signAccessToken(
      user.id,
      user.nickname
    );
    const refreshToken = await this.tokensService.signRefreshToken(
      user.id,
      session.id
    );

    session.refreshTokenHash = await argon2.hash(refreshToken);
    await this.sessionsRepo.save(session);

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

  async rotateRefreshToken(refreshToken: string, ip?: string) {
    const payload = this.verifyRefresh(refreshToken);

    const session = await this.sessionsRepo.findOne({
      where: { id: payload.sid },
      relations: ["user"],
    });
    if (!session || session.revokedAt) {
      throw new ForbiddenException("Invalid session");
    }

    const valid = await argon2
      .verify(session.refreshTokenHash, refreshToken)
      .catch(() => false);
    if (!valid) {
      session.revokedAt = new Date();
      await this.sessionsRepo.save(session);
      throw new ForbiddenException("Token reuse detected");
    }

    if (session.expiresAt < new Date()) {
      throw new ForbiddenException("Session expired");
    }

    const newRefreshToken = await this.tokensService.signRefreshToken(
      payload.sub,
      session.id
    );
    const accessToken = await this.tokensService.signAccessToken(
      payload.sub,
      session.user.nickname
    );

    session.refreshTokenHash = await argon2.hash(newRefreshToken);
    session.expiresAt = new Date(Date.now() + this.refreshTtlMs());
    session.lastUsedAt = new Date();
    session.ip = ip ?? session.ip;
    await this.sessionsRepo.save(session);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;

    const payload = this.verifyRefresh(refreshToken);
    const session = await this.sessionsRepo.findOne({
      where: { id: payload.sid },
    });
    if (session && !session.revokedAt) {
      session.revokedAt = new Date();
      await this.sessionsRepo.save(session);
    }
  }

  private refreshTtlMs() {
    return 14 * 24 * 60 * 60 * 1000;
  }

  private verifyRefresh(token: string): { sub: number; sid: number } {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  private async assertNicknameAvailable(nickname: string): Promise<void> {
    const exists = await this.usersRepo.exist({ where: { nickname } });
    if (exists) {
      throw new ConflictException("Nickname already taken");
    }
  }
}
