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
      { sub: userId, nickname, tokenVersion },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL || "1h",
      }
    );
  }

  async signRefreshToken(userId: number, tokenVersion?: number) {
    return this.jwt.signAsync(
      { sub: userId, tokenVersion },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TTL || "14d",
      }
    );
  }
}
