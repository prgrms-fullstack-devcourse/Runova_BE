import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Put,
    UseGuards,
    UseInterceptors
} from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse, ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse,
    ApiOperation, ApiParam, ApiResetContentResponse,
    ApiTags
} from "@nestjs/swagger";
import { CourseBookmarksService, CoursesService } from "../service";
import { Cached, Caching, User } from "../../utils/decorator";
import { CreateCourseBody, UpdateBookmarkResponse, UpdateCourseBody } from "../api";
import { AuthGuard } from "@nestjs/passport";
import { CourseTopologyDTO } from "../dto";
import { HOUR_IN_MS } from "../../common/constants/datetime";
import { CacheInterceptor } from "../../common/interceptor";

@ApiTags("Courses")
@Controller("/api/courses")
@UseGuards(AuthGuard("jwt"))
@UseInterceptors(CacheInterceptor)
export class CoursesController {

    constructor(
        @Inject(CoursesService)
        private readonly coursesService: CoursesService,
        @Inject(CourseBookmarksService)
        private readonly bookmarksService: CourseBookmarksService,
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
        @Body() body: CreateCourseBody,
    ): Promise<void> {
        await this.coursesService.createCourse({ userId, ...body });
    }



    @Get("/:id/topology")
    @ApiOperation({ summary: "경로 노드(경로의 양 끝 점과 방향 전환이 발생하는 점들)와 경로의 모형(polygon) 조회"})
    @ApiParam({ name: "id", type: "integer", required: true, description: "경로 아이디" })
    @ApiBearerAuth()
    @ApiOkResponse({ type: CourseTopologyDTO })
    @ApiForbiddenResponse()
    @ApiNotFoundResponse({ description: "존재하지 않는 경로" })
    @Caching({ ttl: 12 * HOUR_IN_MS })
    async getCourseNodes(
        @Param("id") id: number,
        @Cached() cached?: CourseTopologyDTO,
    ): Promise<CourseTopologyDTO> {
       return cached ?? await this.coursesService
           .getCourseTopology(id);
    }

    @Put("/:id/bookmarks")
    @ApiOperation({ summary: "경로의 북마크 상태 반전"})
    @ApiParam({ name: "id", type: "integer", required: true, description: "북마크하거나 북마크 해제할 경로 아이디" })
    @ApiBearerAuth()
    @ApiResetContentResponse({ type: UpdateBookmarkResponse })
    @ApiForbiddenResponse()
    @ApiNotFoundResponse({ description: "존재하지 않는 경로" })
    async updateCourseBookmark(
        @Param("id") id: number,
        @User("userId") userId: number,
    ): Promise<UpdateBookmarkResponse> {
       const bookmarked = await this.bookmarksService.updateBookmark(id, userId);
       return { bookmarked };
    }

    @Patch("/:id")
@ApiOperation({ summary: "경로 수정"})
    @ApiParam({ name: "id", type: "integer", required: true, description: "수정할 경로의 아이디" })
    @ApiBody({ type: UpdateCourseBody, required: true })
    @ApiBearerAuth()
    @ApiResetContentResponse()
    @ApiBadRequestResponse({ description: "유효하지 않은 body" })
    @ApiForbiddenResponse()
    async updateCourse(
        @Param("id") id: number,
        @User("userId") userId: number,
        @Body() body: UpdateCourseBody,
    ): Promise<void> {
        await this.coursesService
            .updateCourse({ id, userId, ...body });
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