import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ArrayMaxSize,
  IsUrl,
  IsIn,
} from "class-validator";
import { PostType } from "../../modules/posts/post.entity";
import { Type } from "class-transformer";

export class CreatePostDto {
  @ApiProperty({ enum: PostType })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty({ description: "본문(markdown/text)" })
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  content: string;

  @ApiPropertyOptional({
    type: [String],
    description: "이미지 URL 배열(최대 10)",
  })
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  @IsOptional()
  imageUrls?: string[] = [];

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  routeId?: number;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ enum: PostType })
  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  @IsOptional()
  imageUrls?: string[];

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  routeId?: number;
}

export class ListPostsQuery extends class {} {
  @ApiPropertyOptional({ enum: PostType })
  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  authorId?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  routeId?: number;

  @ApiPropertyOptional({ enum: ["recent", "popular"], default: "recent" })
  @IsIn(["recent", "popular"])
  @IsOptional()
  sort?: "recent" | "popular" = "recent";
}
