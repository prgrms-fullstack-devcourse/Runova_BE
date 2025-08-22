import { Duration } from "@js-joda/core";

export function formatDuration(duration: Duration): string;
export function formatDuration(duration: number): string;

export function formatDuration(
    duration: Duration | number
): string {
    return duration instanceof Duration
        ? __formatDuration(duration)
        : __formatDuration(Duration.ofMillis(duration));
}

function __formatDuration(duration: Duration): string {
    const hours = duration.toHours();
    const minutes = duration.minusHours(hours).toMinutes();
    const seconds = duration.minusHours(hours).minusMinutes(minutes).seconds();

    return [hours, minutes, seconds]
        .map(unit =>
            unit.toString().padStart(2, "0")
        )
        .join(":");
}