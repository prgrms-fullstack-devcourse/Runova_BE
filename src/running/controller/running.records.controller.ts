import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags
} from "@nestjs/swagger";
import { Body, Controller, Get, Inject, Logger, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RunningRecordsService } from "../service";
import { RecordRunningBody, RecordRunningQuery, SearchRunningRecordsQuery, SearchRunningRecordsResponse } from "../api";
import { Cached, Caching, User } from "../../utils/decorator";
import { RunningRecordDTO, RunningRecordPreviewDTO } from "../dto";
import { HOUR_IN_MS } from "../../common/constants/datetime";
import { CacheInterceptor } from "../../common/interceptor";
import { SearchRunningRecordsInterceptor } from "../interceptor";

@ApiTags("Running")
@Controller("/api/running/records")
@UseGuards(AuthGuard("jwt"))
@UseInterceptors(CacheInterceptor)
export class RunningRecordsController {

    constructor(
        @Inject(RunningRecordsService)
        private readonly recordsService: RunningRecordsService,
    ) {}

    @Post("/")
    @ApiOperation({ summary: "러닝 기록 저장" })
    @ApiBearerAuth()
    @ApiQuery({ type: RecordRunningQuery, required: false })
    @ApiBody({ type: RecordRunningBody, required: true })
    @ApiCreatedResponse()
    @ApiBadRequestResponse()
    @ApiForbiddenResponse()
    @ApiNotFoundResponse({ description: "존재하지 않는 courseId" })
    @ApiConflictResponse({ description: "courseId에 해당하는 경로의 모양과 실제 러닝 경로가 많이 다름" })
    async recordRunning(
        @User("userId") userId: number,
        @Body() body: RecordRunningBody,
        @Query() query?: RecordRunningQuery,
    ): Promise<void> {
        Logger.debug(query, RunningRecordsController.name);
        const courseId = query?.courseId;

        await this.recordsService
            .createRunningRecord({ userId, courseId, ...body });
    }

    @Get("/:id")
    @ApiOperation({ summary: "러닝 기록 상세 정보 조회" })
    @ApiBearerAuth()
    @ApiParam({ name: "id", type: "integer", required: true, description: "조회할 러닝 기록 아이디" })
    @ApiOkResponse({ type: RunningRecordDTO })
    @ApiForbiddenResponse()
    @ApiNotFoundResponse()
    async getRunningRecord(
        @Param("id") id: number,
        @User("userId") userId: number,
    ): Promise<RunningRecordDTO> {
        return this.recordsService.getRunningRecord(id, userId);
    }

    @Get("/")
    @ApiOperation({ summary: "유저 러닝 기록 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: SearchRunningRecordsQuery, required: false })
    @ApiOkResponse({ type: SearchRunningRecordsResponse })
    @ApiForbiddenResponse()
    @Caching({ ttl: HOUR_IN_MS })
    @UseInterceptors(SearchRunningRecordsInterceptor)
    async searchRunningRecords(
        @User("userId") userId: number,
        @Query() query?: SearchRunningRecordsQuery,
        @Cached() cached?: SearchRunningRecordsResponse,
    ): Promise<SearchRunningRecordsResponse | RunningRecordPreviewDTO[]> {
        if (cached) return cached;

        return await this.recordsService
            .searchRunningRecords({
                userId,
                period: { since: query?.since, until: query?.until },
                paging: { cursor: query?.cursor, limit: query?.limit },
            });
    }
}