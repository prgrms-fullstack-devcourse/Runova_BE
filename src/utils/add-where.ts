import { ObjectLiteral, WhereExpressionBuilder } from "typeorm";

export function addWhere(
    nWhere: number,
    qb: WhereExpressionBuilder,
    sql: string,
    params?: ObjectLiteral
): number {
    nWhere++ ? qb.andWhere(sql, params) : qb.where(sql, params);
    return nWhere;
}