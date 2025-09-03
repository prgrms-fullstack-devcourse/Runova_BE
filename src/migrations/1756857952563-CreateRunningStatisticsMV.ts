import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRunningStatisticsMV1756857952563 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS running_statistics_mv AS
            SELECT
                r.user_id AS user_id,
                SUM(r.distance)::float8 AS total_distance,
                SUM(EXTRACT(EPOCH FROM (r.end_at - r.start_at)))::double precision AS total_duration,
                AVG(r.pace)::float8 AS mean_pace,
                SUM(r.calories)::float8 AS total_calories
            FROM running_records AS r
            GROUP BY r.user_id
        `);

        await queryRunner.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS UK_running_statistics_mv_user_id
          ON running_statistics_mv (user_id)
        `);

        // --- OPTIONAL: If you prefer to build the MV after deploy ---
        // If you switch the CREATE MATERIALIZED VIEW to "WITH NO DATA" (see below),
        // you can then populate it with a blocking REFRESH (non-concurrent) inside the same transaction:
        //
        // await queryRunner.query('REFRESH MATERIALIZED VIEW running_statistics_mv');
        //
        // Do NOT use CONCURRENTLY here; PostgreSQL forbids CONCURRENTLY inside a transaction.
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS UK_running_statistics_mv_user_id`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS running_statistics_mv`);
    }
}
