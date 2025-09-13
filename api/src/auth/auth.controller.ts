import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  Query,
  Ip,
  ParseBoolPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { Response, Request } from "express";
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { User } from "src/utils/decorator";
import { AuthUser } from "./types/types";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("google")
  @ApiOperation({ summary: "구글 로그인 및 회원가입" })
  @ApiResponse({ status: 200, description: "로그인 성공" })
  async googleLogin(@Body() dto: LoginDto) {
    const { accessToken, user } = await this.authService.loginWithGoogle(
      dto.idToken
    );
    return { accessToken, user };
  }

  // todo : 블랙리스트 구현
  @Post("refresh")
  @ApiOperation({ summary: "AccessToken 재발급" })
  @ApiResponse({ status: 200, description: "재발급 성공" })
  async refreshToken(@Body() dto: RefreshDto, @Req() req: Request) {
    const refreshToken = dto.refreshToken || req.cookies["refresh_token"];
    const result = await this.authService.rotateRefreshToken(refreshToken);
    return { accessToken: result.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @ApiOperation({ summary: "로그아웃 및 세션 종료" })
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: "로그아웃 성공" })
  @ApiQuery({
    name: "deviceAll",
    required: false,
    description: "모든 기기에서 로그아웃",
    type: Boolean,
  })
  async logout(
    @User() user: AuthUser,
    @Query("deviceAll", ParseBoolPipe) deviceAll: boolean
  ) {
    await this.authService.logout(user.userId, deviceAll);
    return; // 204 No Content
  }
}
