import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as argon2 from "argon2";
import { User } from "../modules/users/user.entity";
import { SocialAccount } from "../modules/auth/social-account.entity";
import { UserSession } from "../modules/auth/user-session.entity";
import { TokensService } from "./tokens.service";
import * as jwt from "jsonwebtoken";
import { GoogleService } from "./google.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(SocialAccount)
    private readonly socialRepo: Repository<SocialAccount>,
    @InjectRepository(UserSession)
    private readonly sessionsRepo: Repository<UserSession>,
    private readonly tokensService: TokensService,
    private readonly googleService: GoogleService
  ) {}

  async loginWithGoogle(idToken: string, deviceInfo?: string, ip?: string) {
    const { sub, email, name, picture } =
      await this.googleService.verifyIdToken(idToken);

    let social = await this.socialRepo.findOne({
      where: { provider: "GOOGLE", providerUserId: sub },
      relations: ["user"],
    });

    if (!social) {
      const safeEmail = email ?? `${sub}@google.local`;
      const nickname = await this.generateUniqueNickname(
        name || email?.split("@")[0] || "runner"
      );

      const user = this.usersRepo.create({
        email: safeEmail,
        nickname,
        avatarUrl: picture,
      });
      await this.usersRepo.save(user);

      social = this.socialRepo.create({
        provider: "GOOGLE",
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
    if (!session || session.revokedAt)
      throw new ForbiddenException("Invalid session");

    const valid = await argon2
      .verify(session.refreshTokenHash, refreshToken)
      .catch(() => false);
    if (!valid) {
      session.revokedAt = new Date();
      await this.sessionsRepo.save(session);
      throw new ForbiddenException("Token reuse detected");
    }

    if (session.expiresAt < new Date())
      throw new ForbiddenException("Session expired");

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

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
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

  private async generateUniqueNickname(base: string): Promise<string> {
    const cleaned = base.replace(/\s+/g, "").slice(0, 20);
    let candidate = cleaned;
    for (let i = 0; i < 50; i++) {
      const exists = await this.usersRepo.exist({
        where: { nickname: candidate },
      });
      if (!exists) return candidate;
      candidate = `${cleaned}${Math.floor(Math.random() * 10000)}`;
    }
    throw new ConflictException("Cannot allocate unique nickname");
  }
}
