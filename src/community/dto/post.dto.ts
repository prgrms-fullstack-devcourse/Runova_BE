import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { PostType } from "../../modules/posts/post.entity";
import { Type } from "class-transformer";

export class CreatePostDto {
  @ApiProperty({ enum: PostType }) @IsEnum(PostType) type: PostType;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) title: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(50000) content: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string | null;

  @ApiPropertyOptional()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  routeId: number;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ enum: PostType })
  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  @IsOptional()
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string | null;

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
