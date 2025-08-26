import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GoogleService } from "./google.service";
import { TokensService } from "./tokens.service";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../modules/users/user.entity";
import { AccessJwtStrategy } from "./strategies/access-jwt.strategy";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_TTL },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleService, TokensService, AccessJwtStrategy],
})
export class AuthModule {}
