import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { FilesService } from "./files.service";
import { PresignFileDto } from "./dto/presign-file.dto";
import { User } from "src/utils/decorator/http.decorators";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("presign")
  @UseGuards(JwtAuthGuard)
  async presign(@User("userId") userId: number, @Body() dto: PresignFileDto) {
    return this.filesService.getPresignedUrl(
      dto.type,
      dto.contentType,
      dto.size,
      userId
    );
  }
}
