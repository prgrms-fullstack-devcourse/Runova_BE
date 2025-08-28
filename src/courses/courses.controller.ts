import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse,
    ApiOperation, ApiParam, ApiQuery,
    ApiTags
} from "@nestjs/swagger";
import { CoursesService, SearchCoursesService } from "./service";
import { CourseDTO } from "./dto";
import { User } from "../utils/decorator";
import {
    CreateCourseBody,
    SearchAdjacentCoursesQuery,
    SearchAdjacentCoursesResponse,
    SearchCoursesQuery,
    SearchCoursesResponse
} from "./api";
import { AuthGuard } from "@nestjs/passport";
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";

@ApiTags("Courses")
@Controller("/api/courses")
@UseGuards(AuthGuard("jwt"))
export class CoursesController {

    constructor(
        @Inject(CoursesService)
        private readonly coursesService: CoursesService,
        @Inject(SearchCoursesService)
        private readonly searchCoursesService: SearchCoursesService,
        @Inject(CACHE_MANAGER)
        private readonly cache: Cache,
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

    @Get("/search/users")
    @ApiOperation({ summary: "내 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: SearchCoursesQuery, required: false })
    @ApiOkResponse({ type: SearchCoursesResponse })
    @ApiForbiddenResponse()
    async searchUserCourses(
        @User("userId") userId: number,
        @Query() query?: SearchCoursesQuery,
    ): Promise<SearchCoursesResponse> {

        const results = await this.searchCoursesService
            .searchCourses(query ? { userId, ...query } : { userId });

        return { results };
    }

    @Get("/search/adjacent")
    @ApiOperation({ summary: "주변 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: SearchAdjacentCoursesQuery, required: true })
    @ApiOkResponse({ type: SearchAdjacentCoursesResponse })
    @ApiForbiddenResponse()
    async searchAdjacentCourses(
       @Query() query: SearchAdjacentCoursesQuery,
    ): Promise<SearchAdjacentCoursesResponse> {

        const results = await this.searchCoursesService
            .searchAdjacentCourses(query);

        return { results };
    }
}