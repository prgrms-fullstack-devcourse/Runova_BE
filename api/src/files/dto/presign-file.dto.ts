import { IsEnum, IsMimeType, IsNumber, Min, Max } from "class-validator";
import { UploadType } from "../../common/constants/upload-type.enum";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export class PresignFileDto {
  @IsEnum(UploadType)
  type: UploadType;

  @IsMimeType()
  contentType: string;

  @IsNumber()
  @Min(1)
  @Max(MAX_FILE_SIZE)
  size: number;
}
