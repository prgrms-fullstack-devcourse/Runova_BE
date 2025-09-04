import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse,
    ApiOperation, ApiParam, ApiQuery,
    ApiTags
} from "@nestjs/swagger";
import { Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RunningRecordsService } from "../service/records";
import { CreateRunningRecordBody, SearchRunningRecordsQuery, SearchRunningRecordsResponse } from "../api/records";
import { User } from "../../utils/decorator";
import { RunningRecordDTO } from "../records/dto";

@ApiTags("Running")
@Controller("/api/running/records")
@UseGuards(AuthGuard("jwt"))
export class RunningController {

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
    ): Promise<RunningRecordDTO> {
        return this.recordsService.getRunningRecord(id);
    }

    @Get("/users")
    @ApiOperation({ summary: "유저 러닝 기록 검색" })
    @ApiBearerAuth()
    @ApiQuery({ type: SearchRunningRecordsQuery, required: false })
    @ApiOkResponse({ type: SearchRunningRecordsResponse })
    @ApiForbiddenResponse()
    async searchUserRunningRecords(
        @User("userId") userId: number,
        @Query() query?: SearchRunningRecordsQuery,
    ): Promise<SearchRunningRecordsResponse> {
        const q = query ?? {};

        const results = await this.recordsService
            .searchRunningRecords({ userId, ...q });

        return { results };
    }
}