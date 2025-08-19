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
  @ApiProperty({ enum: PostType }) @IsEnum(PostType) type: PostType;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(50000) content: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  @IsOptional()
  imageUrls?: string[] = [];

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
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
  @Type(() => Number)
  @IsOptional()
  routeId?: number;
}

export class ListPostsFilter {
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
}
