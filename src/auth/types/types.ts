export interface JwtPayload {
  sub: number;
  nickname: string;
}

export interface AuthUser {
  userId: number;
  nickname: string;
}
