import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokensService {
  constructor(private readonly jwt: JwtService) {}

  async signAccessToken(
    userId: number,
    nickname: string,
    tokenVersion?: number
  ) {
    return this.jwt.signAsync(
      { sub: userId, nickname, v: tokenVersion },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL || "900s",
      }
    );
  }

  async signRefreshToken(userId: number, tokenVersion?: number) {
    return this.jwt.signAsync(
      { sub: userId, v: tokenVersion },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TTL || "14d",
      }
    );
  }
}
