import { Module } from "@nestjs/common";
import { CommunityController } from "./community.controller";
import { CommunityService } from "./community.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "src/modules/posts/comment.entity";
import { PostLike } from "src/modules/posts/post-like.entity";
import { Post } from "src/modules/posts/post.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, PostLike])],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
