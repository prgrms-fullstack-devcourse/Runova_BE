import { User } from "src/modules/users/user.entity";

export interface JwtPayload {
  sub: number;
  nickname: string;
}

export interface AuthUser {
  userId: number;
  nickname: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
