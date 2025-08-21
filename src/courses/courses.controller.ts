import { Body, Controller, Get, Inject, Param, Post, UseGuards } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse,
    ApiOperation, ApiParam,
    ApiTags
} from "@nestjs/swagger";
import { CoursesService } from "./service";
import { CourseDTO } from "./dto";
import { User } from "../utils/decorator";
import { CreateCourseBody, GetCoursesResponse } from "./api";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("Courses")
@Controller("/api/courses")
@UseGuards(AuthGuard("jwt"))
export class CoursesController {

    constructor(
        @Inject(CoursesService)
        private readonly coursesService: CoursesService,
    ) {}

    @Post("/")
    @ApiOperation({ summary: "경로 생성" })
    @ApiBearerAuth()
    @ApiBody({ type: CreateCourseBody, required: true })
    @ApiCreatedResponse()
    @ApiBadRequestResponse({ description: "요청 바디가 유효하지 않음" })
    @ApiForbiddenResponse()
    async createCourse(
        @User("userId") userId: number,
        @Body() { path }: CreateCourseBody,
    ): Promise<void> {
        await this.coursesService.createCourse(userId, path);
    }

    @Get("/:id")
    @ApiOperation({ summary: "내 경로 조회" })
    @ApiBearerAuth()
    @ApiParam({ name: "id", type: "integer", required: true, description: "조회할 경로 아이디" })
    @ApiOkResponse({ type: CourseDTO })
    @ApiForbiddenResponse()
    async getCourse(
        @Param("id") id: number,
    ): Promise<CourseDTO> {
       return this.coursesService.getCourse(id);
    }

    @Get("/")
    @ApiOperation({ summary: "내 경로 조회" })
    @ApiBearerAuth()
    @ApiOkResponse({ type: GetCoursesResponse })
    @ApiForbiddenResponse()
    async getUserCourses(
        @User("userId") userId: number,
    ): Promise<GetCoursesResponse> {
        const results = await this.coursesService.getCourses({ userId });
        return { results };
    }
}