import {
  Body,
  Controller,
  Get,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Response, Request } from "express";

class GoogleLoginDto {
  idToken: string;
  deviceInfo?: string;
}

class RefreshDto {
  refreshToken?: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("google")
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.loginWithGoogle(
      dto.idToken,
      dto.deviceInfo,
      ip
    );

    // 모바일(RN)은 바디로, Web은 쿠키로 RT 처리 가능
    this.setRefreshCookie(res, result.refreshToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post("refresh")
  async refreshToken(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string
  ) {
    const refreshToken = dto.refreshToken || req.cookies["refresh_token"];
    const result = await this.authService.rotateRefreshToken(refreshToken, ip);

    this.setRefreshCookie(res, result.refreshToken);
    return {
      accessToken: result.accessToken,
    };
  }

  @Post("logout")
  async logout(@Body() dto: RefreshDto) {
    await this.authService.logout(dto.refreshToken);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@Req() req: any) {
    return {
      userId: req.user.userId,
      nickname: req.user.nickname,
    };
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refresh_token", token, {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: isProd ? "none" : "lax",
      path: "/auth",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });
  }
}
