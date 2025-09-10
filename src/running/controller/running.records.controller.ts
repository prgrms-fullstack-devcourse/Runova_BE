import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse,
    ApiOperation, ApiParam, ApiQuery,
    ApiTags
} from "@nestjs/swagger";
import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RunningRecordsService } from "../service";
import { CreateRunningRecordBody, SearchRunningRecordsQuery, SearchRunningRecordsResponse } from "../api";
import { Cached, Caching, User } from "../../utils/decorator";
import { RunningRecordDTO } from "../dto";
import { HOUR_IN_MS } from "../../common/constants/datetime";
import { CacheInterceptor } from "../../common/interceptor";

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
    @ApiBody({ type: CreateRunningRecordBody, required: true })
    @ApiCreatedResponse()
    @ApiBadRequestResponse()
    @ApiForbiddenResponse()
    async createRunningRecord(
        @User("userId") userId: number,
        @Body() body: CreateRunningRecordBody,
    ): Promise<void> {
        await this.recordsService
            .createRunningRecord({ userId, ...body });
    }

    @Get("/detail/:id")
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
    async searchRunningRecords(
        @User("userId") userId: number,
        @Query() query?: SearchRunningRecordsQuery,
        @Cached() data?: SearchRunningRecordsResponse,
    ): Promise<SearchRunningRecordsResponse> {
        if (data) return data;

        const results = await this.recordsService
            .searchRunningRecords({
                userId,
                period: { since: query?.since, until: query?.until },
                paging: { cursor: query?.cursor, limit: query?.limit },
            });

        return { results };
    }
}