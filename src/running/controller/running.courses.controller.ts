import { Body, Controller, Delete, Get, Inject, Param, Post, Query, UseGuards } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse,
    ApiOperation, ApiParam, ApiQuery,
    ApiTags
} from "@nestjs/swagger";
import { CourseNodesService, CoursesService, SearchCoursesService } from "../service/courses";
import { Cached, Caching, User } from "../../utils/decorator";
import {
    CreateRunningCourseBody, GetRunningCourseNodesResponse,
    SearchAdjacentRunningCoursesQuery,
    SearchAdjacentRunningCoursesResponse,
    SearchRunningCoursesResponse
} from "../api/courses";
import { AuthGuard } from "@nestjs/passport";
import { PagingOptions } from "../../common/paging";

@ApiTags("Courses")
@Controller("/api/courses")
@UseGuards(AuthGuard("jwt"))
export class RunningCoursesController {

    constructor(
        @Inject(CoursesService)
        private readonly coursesService: CoursesService,
        @Inject(SearchCoursesService)
        private readonly searchCoursesService: SearchCoursesService,
        @Inject(CourseNodesService)
        private readonly nodesService: CourseNodesService,
    ) {}

    @Post("/")
    @ApiOperation({ summary: "경로 생성" })
    @ApiBearerAuth()
    @ApiBody({ type: CreateRunningCourseBody, required: true })
    @ApiCreatedResponse()
    @ApiBadRequestResponse({ description: "요청 바디가 유효하지 않음" })
    @ApiForbiddenResponse()
    async createCourse(
        @User("userId") userId: number,
        @Body() body: CreateRunningCourseBody,
    ): Promise<void> {
        await this.coursesService.createCourse({ userId, ...body });
    }

    @Get("/search/users")
    @ApiOperation({ summary: "내가 만든 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: PagingOptions, required: false })
    @ApiOkResponse({ type: SearchRunningCoursesResponse })
    @ApiForbiddenResponse()
    @Caching({ schema: SearchRunningCoursesResponse })
    async searchUserCourses(
        @User("userId") userId: number,
        @Query() query?: PagingOptions,
        @Cached() cached?: SearchRunningCoursesResponse,
    ): Promise<SearchRunningCoursesResponse> {
        if (cached) return cached;

        const results = await this.searchCoursesService
            .searchUserCourses(userId, query);

        return { results };
    }

    @Get("/search/bookmarked")
    @ApiOperation({ summary: "북마크한 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: PagingOptions, required: false })
    @ApiOkResponse({ type: SearchRunningCoursesResponse })
    @ApiForbiddenResponse()
    @Caching({ schema: SearchRunningCoursesResponse })
    async searchBookmarkedCourses(
        @User("userId") userId: number,
        @Query() query?: PagingOptions,
        @Cached() cached?: SearchRunningCoursesResponse,
    ): Promise<SearchRunningCoursesResponse> {
        if (cached) return cached;

        const results = await this.searchCoursesService
            .searchBookmarkedCourses(userId, query);

        return { results };
    }

    @Get("/search/completed")
    @ApiOperation({ summary: "완주한 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: PagingOptions, required: false })
    @ApiOkResponse({ type: SearchRunningCoursesResponse })
    @ApiForbiddenResponse()
    @Caching({ schema: SearchRunningCoursesResponse })
    async searchCompletedCourses(
        @User("userId") userId: number,
        @Query() query?: PagingOptions,
        @Cached() cached?: SearchRunningCoursesResponse,
    ): Promise<SearchRunningCoursesResponse> {
        if (cached) return cached;

        const results = await this.searchCoursesService
            .searchCompletedCourses(userId, query);

        return { results };
    }

    @Get("/search/adjacent")
    @ApiOperation({ summary: "주변 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: SearchAdjacentRunningCoursesQuery, required: true })
    @ApiOkResponse({ type: SearchAdjacentRunningCoursesResponse })
    @ApiForbiddenResponse()
    @Caching({ schema: SearchAdjacentRunningCoursesResponse })
    async searchAdjacentCourses(
       @User("userId") userId: number,
       @Query() query: SearchAdjacentRunningCoursesQuery,
       @Cached() cached?: SearchAdjacentRunningCoursesResponse,
    ): Promise<SearchAdjacentRunningCoursesResponse> {
        if (cached) return cached;

        const results = await this.searchCoursesService
            .searchAdjacentCourses({ userId, ...query });

        return { results };
    }

    @Get("/:id/nodes")
    @ApiOperation({ summary: "경로 노드(경로의 양 끝 점과 방향 전환이 발생하는 점들) 조회"})
    @ApiParam({ name: "id", type: "integer", required: true, description: "노드들이 속한 경로의 아이디" })
    @ApiBearerAuth()
    @ApiOkResponse({ type: GetRunningCourseNodesResponse })
    @ApiForbiddenResponse()
    @ApiNotFoundResponse({ description: "존재하지 않는 경로" })
    @Caching({ schema: GetRunningCourseNodesResponse })
    async getCourseNodes(
        @Param("id") id: number,
        @Cached() cached?: GetRunningCourseNodesResponse,
    ): Promise<GetRunningCourseNodesResponse> {
        if (cached) return cached;
        const results = await this.nodesService.getCourseNodes(id);
        return { results };
    }

    @Delete("/:id")
    @ApiOperation({ summary: "경로 삭제"})
    @ApiParam({ name: "id", type: "integer", required: true, description: "삭제할 경로의 아이디" })
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