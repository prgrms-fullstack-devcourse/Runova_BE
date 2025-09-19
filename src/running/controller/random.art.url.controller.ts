import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RandomArtUrlService } from "../service";
import { GetRandomArtUrlResponse } from "../api";
import { User } from "../../utils/decorator";

@ApiTags("Running", "Art")
@Controller("/api/running/art")
@UseGuards(AuthGuard("jwt"))
export class RandomArtUrlController {

    constructor(
       @Inject(RandomArtUrlService)
       private readonly randomArtUrlService: RandomArtUrlService,
    ) {}

    @ApiOperation({ summary: "유저의 러닝 기록 중에서 무작위로 하나를 골라 art url 반한" })
    @ApiBearerAuth()
    @ApiOkResponse({ type: GetRandomArtUrlResponse })
    @ApiForbiddenResponse()
    @Get('/')
    async getRandomArtUrl(
        @User("userId") userId: number,
    ): Promise<GetRandomArtUrlResponse> {

        const artUrl = await this.randomArtUrlService
            .pickRandomArtUrl(userId);

        return { artUrl };
    }

}