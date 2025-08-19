import {
  Controller,
  Get,
  Post as HttpPost,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CommunityService } from "./community.service";
import { CursorQuery } from "./dto/cursor.dto";
import { CreatePostDto, UpdatePostDto, ListPostsFilter } from "./dto/post.dto";
import { CreateCommentDto, UpdateCommentDto } from "./dto/comment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../utils/decorator/http.decorators";

@ApiTags("Community")
@Controller("community")
export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 생성" })
  @ApiResponse({ status: 201 })
  @HttpPost("posts")
  async createPost(@User("userId") userId: number, @Body() dto: CreatePostDto) {
    return this.service.createPost(userId, dto);
  }

  @ApiOperation({ summary: "게시글 목록(커서)" })
  @Get("posts")
  async listPosts(@Query() q: CursorQuery, @Query() f: ListPostsFilter) {
    return this.service.listPostsCursor(q, f);
  }

  @ApiOperation({ summary: "게시글 상세" })
  @Get("posts/:id")
  async getPost(@Param("id") id: string) {
    return this.service.getPost(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 수정(작성자)" })
  @Patch("posts/:id")
  async updatePost(
    @Param("id") id: string,
    @User("userId") userId: number,
    @Body() dto: UpdatePostDto
  ) {
    return this.service.updatePost(Number(id), userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 삭제(soft)" })
  @Delete("posts/:id")
  async deletePost(@Param("id") id: string, @User("userId") userId: number) {
    await this.service.deletePost(Number(id), userId);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 좋아요 토글" })
  @HttpPost("posts/:id/like")
  async toggleLike(@Param("id") id: string, @User("userId") userId: number) {
    return this.service.togglePostLike(Number(id), userId);
  }

  // Comments (ASC cursor)
  @ApiOperation({ summary: "댓글 목록(커서, ASC)" })
  @Get("posts/:postId/comments")
  async listComments(@Param("postId") postId: string, @Query() q: CursorQuery) {
    return this.service.listCommentsCursor(Number(postId), q);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "댓글 생성" })
  @HttpPost("posts/:postId/comments")
  async createComment(
    @Param("postId") postId: string,
    @User("userId") userId: number,
    @Body() dto: CreateCommentDto
  ) {
    return this.service.createComment(Number(postId), userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "댓글 수정(작성자)" })
  @Patch("comments/:id")
  async updateComment(
    @Param("id") id: string,
    @User("userId") userId: number,
    @Body() dto: UpdateCommentDto
  ) {
    return this.service.updateComment(Number(id), userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "댓글 삭제(작성자)" })
  @Delete("comments/:id")
  async deleteComment(@Param("id") id: string, @User("userId") userId: number) {
    await this.service.deleteComment(Number(id), userId);
    return { ok: true };
  }
}
