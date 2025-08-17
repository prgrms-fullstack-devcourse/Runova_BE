import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleService } from "./google.service";
import { TokensService } from "./tokens.service";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../modules/users/user.entity";
import { SocialAccount } from "../modules/auth/social-account.entity";
import { UserSession } from "../modules/auth/user-session.entity";
import { AccessJwtStrategy } from "./strategies/access-jwt.strategy";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SocialAccount, UserSession]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET, // 또는 직접 문자열
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }, // 기본 옵션
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleService, TokensService, AccessJwtStrategy],
})
export class AuthModule {}
