import { IsInt, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RunningDashboardDTO {
    @IsInt()
    @ApiProperty({ type: "integer", description: "통계 대상이 된 레코드 수" })
    nRecords: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ type: "number", description: "달린 총 거리(m)" })
    totalDistance: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ type: "number", description: "총 러닝 지속 시간(s))" })
    totalDuration: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ type: "number", description: "소모한 총 칼로리(kcal)" })
    totalCalories: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({ type: "number", description: "평균 페이스(m/s)" })
    meanPace: number;
}