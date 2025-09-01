import { Body, Controller, Delete, Get, Inject, Param, Post, Query, UseGuards } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse, ApiForbiddenResponse, ApiNoContentResponse, ApiOkResponse,
    ApiOperation, ApiParam, ApiQuery,
    ApiTags
} from "@nestjs/swagger";
import { CoursesService, SearchCoursesService } from "./service";
import { Cached, User } from "../utils/decorator";
import {
    CreateCourseBody,
    SearchAdjacentCoursesQuery,
    SearchAdjacentCoursesResponse,
    SearchCoursesResponse
} from "./api";
import { AuthGuard } from "@nestjs/passport";
import { PagingOptions } from "../common/paging";

@ApiTags("Courses")
@Controller("/api/courses")
@UseGuards(AuthGuard("jwt"))
export class CoursesController {

    constructor(
        @Inject(CoursesService)
        private readonly coursesService: CoursesService,
        @Inject(SearchCoursesService)
        private readonly searchCoursesService: SearchCoursesService,
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

    @Get("/search/users")
    @ApiOperation({ summary: "내가 만든 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: PagingOptions, required: false })
    @ApiOkResponse({ type: SearchCoursesResponse })
    @ApiForbiddenResponse()
    async searchUserCourses(
        @User("userId") userId: number,
        @Query() query?: PagingOptions,
        @Cached() cached?: SearchCoursesResponse,
    ): Promise<SearchCoursesResponse> {
        if (cached) return cached;

        const results = await this.searchCoursesService
            .searchUserCourses(userId, query);

        return { results };
    }

    @Get("/search/bookmarks")
    @ApiOperation({ summary: "북마크한 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: PagingOptions, required: false })
    @ApiOkResponse({ type: SearchCoursesResponse })
    @ApiForbiddenResponse()
    async searchBookmarkedCourses(
        @User("userId") userId: number,
        @Query() query?: PagingOptions,
        @Cached() cached?: SearchCoursesResponse,
    ): Promise<SearchCoursesResponse> {
        if (cached) return cached;

        const results = await this.searchCoursesService
            .searchBookmarkedCourses(userId, query);

        return { results };
    }

    @Get("/search/adjacent")
    @ApiOperation({ summary: "주변 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: SearchAdjacentCoursesQuery, required: true })
    @ApiOkResponse({ type: SearchAdjacentCoursesResponse })
    @ApiForbiddenResponse()
    async searchAdjacentCourses(
       @User("userId") userId: number,
       @Query() query: SearchAdjacentCoursesQuery,
       @Cached() cached?: SearchAdjacentCoursesResponse,
    ): Promise<SearchAdjacentCoursesResponse> {
        if (cached) return cached;

        const results = await this.searchCoursesService
            .searchAdjacentCourses({ userId, ...query });

        return { results };
    }

    @Delete("/:id")
    @ApiOperation({ summary: "경로 삭제"})
    @ApiParam({ name: "id", type: "integer", description: "삭제할 경로의 아이디" })
    @ApiBearerAuth()
    @ApiNoContentResponse()
    @ApiForbiddenResponse()
    async deleteCourse(
        @Param("id") id: number,
        @User("userId") userId: number,
    ): Promise<void> {
        await this.coursesService.deleteCourse(id, userId);
    }
}