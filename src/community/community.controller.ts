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
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from "@nestjs/swagger";
import { CommunityService } from "./community.service";
import { CursorQuery } from "./dto/cursor.dto";
import { CreatePostDto, UpdatePostDto, ListPostsFilter } from "./dto/post.dto";
import { CreateCommentDto, UpdateCommentDto } from "./dto/comment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../utils/decorator/http.decorators";

@ApiTags("Community")
@Controller("community")
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 생성" })
  @ApiResponse({ status: 201, description: "생성 성공" })
  @HttpPost("posts")
  async createPost(@User("userId") userId: number, @Body() dto: CreatePostDto) {
    return this.service.createPost(userId, dto);
  }

  @ApiOperation({ summary: "게시글 목록(커서 기반, 최신순)" })
  @ApiResponse({ status: 200, description: "조회 성공" })
  @Get("posts")
  async listPosts(
    @Query() query: CursorQuery,
    @Query() filter: ListPostsFilter
  ) {
    return this.service.listPostsCursor(query, filter);
  }

  @ApiOperation({ summary: "게시글 상세" })
  @ApiResponse({ status: 200, description: "조회 성공" })
  @ApiParam({ name: "id", type: Number })
  @Get("posts/:id")
  async getPost(@Param("id", ParseIntPipe) id: number) {
    return this.service.getPost(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 수정(작성자)" })
  @ApiResponse({ status: 200, description: "수정 성공" })
  @ApiParam({ name: "id", type: Number })
  @Patch("posts/:id")
  async updatePost(
    @Param("id", ParseIntPipe) id: number,
    @User("userId") userId: number,
    @Body() dto: UpdatePostDto
  ) {
    return this.service.updatePost(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 삭제(soft delete)" })
  @ApiResponse({ status: 200, description: "삭제 성공" })
  @ApiParam({ name: "id", type: Number })
  @Delete("posts/:id")
  async deletePost(
    @Param("id", ParseIntPipe) id: number,
    @User("userId") userId: number
  ) {
    await this.service.deletePost(id, userId);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "게시글 좋아요 토글" })
  @ApiResponse({ status: 200, description: "토글 성공" })
  @ApiParam({ name: "id", type: Number })
  @HttpPost("posts/:id/like")
  async toggleLike(
    @Param("id", ParseIntPipe) id: number,
    @User("userId") userId: number
  ) {
    return this.service.togglePostLike(id, userId);
  }

  @ApiOperation({ summary: "댓글 목록(커서, 오래된순)" })
  @ApiResponse({ status: 200, description: "조회 성공" })
  @ApiParam({ name: "postId", type: Number })
  @Get("posts/:postId/comments")
  async listComments(
    @Param("postId", ParseIntPipe) postId: number,
    @Query() query: CursorQuery
  ) {
    return this.service.listCommentsCursor(postId, query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "댓글 생성" })
  @ApiResponse({ status: 201, description: "생성 성공" })
  @ApiParam({ name: "postId", type: Number })
  @HttpPost("posts/:postId/comments")
  async createComment(
    @Param("postId", ParseIntPipe) postId: number,
    @User("userId") userId: number,
    @Body() dto: CreateCommentDto
  ) {
    return this.service.createComment(postId, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "댓글 수정(작성자)" })
  @ApiResponse({ status: 200, description: "수정 성공" })
  @ApiParam({ name: "id", type: Number })
  @Patch("comments/:id")
  async updateComment(
    @Param("id", ParseIntPipe) id: number,
    @User("userId") userId: number,
    @Body() dto: UpdateCommentDto
  ) {
    return this.service.updateComment(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "댓글 삭제(작성자)" })
  @ApiResponse({ status: 200, description: "삭제 성공" })
  @ApiParam({ name: "id", type: Number })
  @Delete("comments/:id")
  async deleteComment(
    @Param("id", ParseIntPipe) id: number,
    @User("userId") userId: number
  ) {
    await this.service.deleteComment(id, userId);
    return { ok: true };
  }
}
