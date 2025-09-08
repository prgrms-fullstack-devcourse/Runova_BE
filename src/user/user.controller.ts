import { Controller, Get, Patch, Body, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "src/utils/decorator/http.decorators";
import { UpdateAvatarDto } from "./dto/updateAvatar.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "내 정보 조회 (인증 필요)" })
  @ApiResponse({ status: 200, description: "조회 성공" })
  async getMe(@User() userId: number) {
    return this.userService.getMeWithAvatarUrl(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me/avatar")
  @ApiBearerAuth()
  @ApiOperation({ summary: "내 아바타 업데이트 (인증 필요)" })
  @ApiResponse({ status: 200, description: "업데이트 성공" })
  async updateMyAvatar(@User() userId: number, @Body() dto: UpdateAvatarDto) {
    await this.userService.updateAvatarKey(userId, dto.key);
    const me = await this.userService.getMeWithAvatarUrl(userId);
    return {
      success: true,
      avatarKey: me.avatarKey ?? null,
      avatarUrl: me.avatarUrl,
    };
  }
}
