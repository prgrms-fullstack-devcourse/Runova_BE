import { Body, Controller, Patch, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { User } from "src/utils/decorator/http.decorators";

@Controller("user")
export class UserController {
  @Patch("me/avatar")
  @UseGuards(JwtAuthGuard)
  async updateAvatar(@User() userId: number, @Body("key") key: string) {
    return this.usersService.updateAvatar(userId, key);
  }
}
