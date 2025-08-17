import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
    if (!jwtAccessSecret) {
      throw new Error("JWT_ACCESS_SECRET environment variable is not set.");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtAccessSecret,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      nickname: payload.nickname,
    };
  }
}
