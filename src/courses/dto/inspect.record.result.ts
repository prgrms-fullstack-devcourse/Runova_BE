import { IsBoolean } from "class-validator";

export class InspectRecordResult {
    @IsBoolean()
    isExists: boolean;

    @IsBoolean()
    hasValidPath: boolean;
}