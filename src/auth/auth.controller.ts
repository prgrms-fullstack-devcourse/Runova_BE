import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  Ip,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Response, Request } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { User } from "src/utils/decorator";
import { AuthUser } from "./types/types";

class GoogleLoginDto {
  idToken: string;
  deviceInfo?: string;
}
class RefreshDto {
  refreshToken?: string;
}

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("google")
  @ApiOperation({ summary: "구글 로그인 및 회원가입" })
  @ApiResponse({ status: 200, description: "로그인 성공" })
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
    this.setRefreshCookie(res, result.refreshToken);
    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  // todo : 블랙리스트 구현
  @Post("refresh")
  @ApiOperation({ summary: "AccessToken 재발급" })
  @ApiResponse({ status: 200, description: "재발급 성공" })
  async refreshToken(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string
  ) {
    const refreshToken = dto.refreshToken || req.cookies["refresh_token"];
    const result = await this.authService.rotateRefreshToken(refreshToken, ip);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Post("logout")
  @ApiOperation({ summary: "로그아웃 및 세션 종료" })
  async logout(@Body() dto: RefreshDto) {
    await this.authService.logout(dto.refreshToken);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "내 정보 조회 (인증 필요)" })
  @ApiResponse({ status: 200, description: "조회 성공" })
  async me(@User() user: AuthUser) {
    return {
      userId: user.userId,
      nickname: user.nickname,
    };
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refresh_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/auth",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });
  }
}
