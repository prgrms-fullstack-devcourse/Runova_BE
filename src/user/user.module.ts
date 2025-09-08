import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/modules/users/user.entity";
import { Course } from "src/modules/courses";
import { Post } from "../modules/posts/post.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Course, Post])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
