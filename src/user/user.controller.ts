import { Controller, Get, Patch, Body, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "src/utils/decorator/http.decorators";
import { AuthUser } from "../auth/types/types";
import { UserService } from "./user.service";
import { UpdateAvatarDto } from "./dto/updateAvatar.dto";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me/profile")
  @ApiOperation({ summary: "내 프로필+최근 항목 통합 조회" })
  @ApiResponse({ status: 200, description: "조회 성공" })
  async getProfile(@User() user: AuthUser) {
    return this.userService.getProfile(user.userId);
  }

  @Patch("me/avatar")
  @ApiOperation({ summary: "내 아바타 업데이트(확정)" })
  @ApiResponse({ status: 200, description: "업데이트 성공" })
  async updateMyAvatar(@User() user: AuthUser) {
    return this.userService.getProfile(user.userId);
  }
}
