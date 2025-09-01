import { Body, Controller, Post } from "@nestjs/common";
import { FilesService } from "./files.service";
import { PresignFileDto } from "./dto/presign-file.dto";
import { User } from "src/utils/decorator/http.decorators";

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("presign")
  async presign(@User("userId") userId: number, @Body() dto: PresignFileDto) {
    return this.filesService.getPresignedUrl(
      dto.type,
      dto.contentType,
      dto.size,
      userId
    );
  }
}
