import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../utils/decorator/http.decorators";
import { AuthUser } from "../auth/types/types";
import { MyPageService } from "./mypage.service";
import { MyPageOverviewDto } from "./dto/mypage.dto";

@ApiTags("MyPage")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("api/v1/mypage")
export class MyPageController {
  constructor(private readonly service: MyPageService) {}

  @Get("overview")
  @ApiOperation({ summary: "마이페이지 미리보기 조회" })
  @ApiResponse({
    status: 200,
    description: "조회 성공",
    type: MyPageOverviewDto as any,
  })
  async overview(@User() user: AuthUser): Promise<MyPageOverviewDto> {
    return this.service.getOverview(user.userId);
  }
}
