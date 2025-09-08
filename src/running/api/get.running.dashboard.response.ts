import { RunningStatisticsSchema } from "../dto";

export class GetRunningDashboardResponse extends RunningStatisticsSchema(
    ["totalDistance", "totalDuration", "totalCalories", "meanPace"]
) {}