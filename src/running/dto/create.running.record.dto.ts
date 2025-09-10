import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { ApiLineProperty, IsLine } from "../../utils/decorator";

export class CreateRunningRecordDTO {
    userId: number;

    @IsLine()
    @ApiLineProperty({ required: true })
    path: [number, number][];

    @IsDate()
    @Type(() => Date)    
    @ApiProperty({ type: Date, required: true, description: "러닝 시작 일시"})
    startAt: Date;

    @IsDate()
    @Type(() => Date)
    @ApiProperty({ type: Date, required: true, description: "러닝 종료 일시"})
    endAt: Date;

    @IsNumber()
    @ApiProperty({ type: "number", required: true, description: "평균 속력(m/s)" })
    pace: number;

    @IsNumber()
    @ApiProperty({ type: "number", required: true, description: "소모 칼로리(kcal)" })
    calories: number;
}
