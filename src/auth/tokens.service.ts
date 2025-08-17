import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokensService {
  constructor(private readonly jwt: JwtService) {}

  async signAccessToken(userId: number, nickname?: string) {
    return this.jwt.signAsync(
      { sub: userId, nickname },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL || "900s", // 15분
      }
    );
  }

  async signRefreshToken(userId: number, sessionId: number) {
    return this.jwt.signAsync(
      { sub: userId, sid: sessionId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TTL || "14d",
      }
    );
  }
}
