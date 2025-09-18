import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Inject, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CacheInterceptor } from "../../common/interceptor";
import { SearchCoursesInterceptor, SearchCoursesResponseInterceptor } from "../interceptor";
import { SearchCoursesService } from "../service";
import { SearchAdjacentCoursesQuery, SearchCoursesResponse } from "../api";
import { Cached, Caching, User } from "../../utils/decorator";
import { MINUTE_IN_MS } from "../../common/constants/datetime";
import { CourseDTO } from "../dto";
import { BasicPagingOptions } from "../../common/types";

@ApiTags("Courses")
@Controller("/api/courses/search")
@UseGuards(AuthGuard("jwt"))
@UseInterceptors(
    CacheInterceptor,
    SearchCoursesInterceptor,
    SearchCoursesResponseInterceptor,
)
export class SearchCoursesController {

    constructor(
        @Inject(SearchCoursesService)
        private readonly searchCoursesService: SearchCoursesService,
    ) {}

    @Get("/users")
    @ApiOperation({ summary: "내가 만든 경로 검색" })
    @ApiQuery({ type: BasicPagingOptions, required: false })
    @ApiBearerAuth()
    @ApiOkResponse({ type: SearchCoursesResponse })
    @ApiForbiddenResponse()
    @Caching({ ttl: 1.5 * MINUTE_IN_MS })
    async searchUserCourses(
        @User("userId") userId: number,
        @User("pace") pace: number,
        @Query() query?: BasicPagingOptions,
        @Cached() cached?: SearchCoursesResponse,
    ): Promise<CourseDTO[] | SearchCoursesResponse> {
        return cached ?? await this.searchCoursesService
            .searchUserCourses({ userId, pace, paging: query });
    }

    @Get("/bookmarked")
    @ApiOperation({ summary: "북마크한 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: BasicPagingOptions, required: false })
    @ApiOkResponse({ type: SearchCoursesResponse })
    @ApiForbiddenResponse()
    @Caching({ ttl: 1.5 * MINUTE_IN_MS })
    async searchBookmarkedCourses(
        @User("userId") userId: number,
        @User("pace") pace: number,
        @Query() query?: BasicPagingOptions,
        @Cached() cached?: SearchCoursesResponse,
    ): Promise<CourseDTO[] | SearchCoursesResponse> {
        return cached ?? await this.searchCoursesService
            .searchBookmarkedCourses({ userId, pace, paging: query });
    }

    @Get("/completed")
    @ApiOperation({ summary: "완주한 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: BasicPagingOptions, required: false })
    @ApiOkResponse({ type: SearchCoursesResponse })
    @ApiForbiddenResponse()
    @Caching({ ttl: 1.5 * MINUTE_IN_MS })
    async searchCompletedCourses(
        @User("userId") userId: number,
        @User("pace") pace: number,
        @Query() query?: BasicPagingOptions,
        @Cached() cached?: SearchCoursesResponse,
    ): Promise<CourseDTO[] | SearchCoursesResponse> {
        return cached ?? await this.searchCoursesService
            .searchCompletedCourses({ userId, pace, paging: query });
    }

    @Get("/adjacent")
    @ApiOperation({ summary: "주변 경로 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: SearchAdjacentCoursesQuery, required: true })
    @ApiOkResponse({ type: SearchCoursesResponse })
    @ApiForbiddenResponse()
    @Caching({ ttl: 1.5 * MINUTE_IN_MS })
    async searchAdjacentCourses(
        @User("userId") userId: number,
        @User("pace") pace: number,
        @Query() query: SearchAdjacentCoursesQuery,
        @Cached() cached?: SearchCoursesResponse,
    ): Promise<CourseDTO[] | SearchCoursesResponse> {
        return cached ?? await this.searchCoursesService
            .searchAdjacentCourses({ userId, pace, ...query });
    }
}