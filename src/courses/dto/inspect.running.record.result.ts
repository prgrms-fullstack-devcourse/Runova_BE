import { IsBoolean } from "class-validator";

export class InspectRunningRecordResult {
    @IsBoolean()
    isExists: boolean;

    @IsBoolean()
    hasValidPath: boolean;
}