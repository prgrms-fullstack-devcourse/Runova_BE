import { GetRunningStatisticsQuery } from "./get.running.statistics.query";

export class GetFullRunningStatisticsQuery
    extends GetRunningStatisticsQuery<
        "totalDistance" | "totalDuration" | "totalCalories" | "meanPace"
    > {}
