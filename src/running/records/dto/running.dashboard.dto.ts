import { IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RunningDashboardDTO {
    @IsNumber()
    @ApiProperty({ type: "number", description: "달린 총 거리(m)" })
    totalDistance: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "총 러닝 지속 시간(s))" })
    totalDuration: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "소모한 총 칼로리(kcal)" })
    totalCalories: number;

    @IsNumber()
    @ApiProperty({ type: "number", description: "평균 페이스(m/s)" })
    meanPace: number;
}