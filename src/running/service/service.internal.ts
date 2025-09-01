import { SelectQueryBuilder } from "typeorm";
import { RunningRecordFilters } from "../dto";

// --ToDO 필터 적용 로직 구현
export function setFilters<E extends object>(
    qb: SelectQueryBuilder<E>,
    filters: RunningRecordFilters,
): SelectQueryBuilder<E> {
    return qb;
}