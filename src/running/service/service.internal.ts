import { SelectQueryBuilder } from "typeorm";
import { RunningRecordFilters } from "../dto";

export function setFilters<E extends object>(
    qb: SelectQueryBuilder<E>,
    filters: RunningRecordFilters,
): SelectQueryBuilder<E> {
    const { startDate, endDate, limit } = filters;

    startDate && qb.andWhere(
        `record.createdAt >= :startDate`,
        { startDate }
    );

    endDate && qb.andWhere(
        `record.createdAt <= :endDate`,
        { endDate }
    );

    return qb
        .orderBy(`record.createdAt`, "DESC")
        .take(limit);
}