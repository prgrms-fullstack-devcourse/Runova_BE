import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Location } from "../../common/geo";
import { IsDate, IsInt, IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

@ApiExtraModels(Location)
export class CreateRunningRecordDTO {
    userId: number;

    @IsInt()
    @IsOptional()
    @ApiProperty({
        type: "integer",
        required: false,
        description: "경로 아이디(그린 경로 따라 뛴 경우만)"
    })
    courseId?: number;

    @ValidateNested({ each: true })
    @Type(() => Location)
    @ApiProperty({
        type: [Location],
        required: true,
        description: "달린 경로"
    })
    path: Location[];

    @IsNumber()
    @ApiProperty({
        type: "number",
        required: true,
        description: "달린 거리(km)"
    })
    distance: number;

    @IsDate()
    @ApiProperty({ type: Date, required: true, description: "러닝 시작 일시"})
    startAt: Date;

    @IsDate()
    @ApiProperty({ type: Date, required: true, description: "러닝 종료 일시"})
    endAt: Date;

    @IsNumber()
    @ApiProperty({ type: "number", required: true, description: "평균 속력(km/h)" })
    pace: number;

    @IsNumber()
    @ApiProperty({ type: "number", required: true, description: "소모 칼로리(kcal)" })
    calories: number;
}