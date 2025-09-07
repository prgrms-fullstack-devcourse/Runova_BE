import { SelectQueryBuilder } from "typeorm";
import { RunningRecordFilters } from "../dto";

export function setFilters<E extends object>(
    qb: SelectQueryBuilder<E>,
    filters: RunningRecordFilters,
): SelectQueryBuilder<E> {
    const { startDate, endDate, limit } = filters;

    startDate && qb.andWhere(
        `running.createdAt >= :startDate`,
        { startDate }
    );

    endDate && qb.andWhere(
        `running.createdAt <= :endDate`,
        { endDate }
    );

    return qb
        .orderBy(`record.createdAt`, "DESC")
        .take(limit);
}