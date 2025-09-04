import { IsBoolean } from "class-validator";

export class InspectRecordResult {
    @IsBoolean()
    isExists: boolean;

    @IsBoolean()
    isOwn: boolean;

    @IsBoolean()
    hasValidPath: boolean;
}