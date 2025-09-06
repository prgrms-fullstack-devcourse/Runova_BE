import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCoursesTable1756975555863 implements MigrationInterface {
    name = "UpdateCoursesTable1756975555863";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN departure`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN length`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN time`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN n_completed`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN departure geometry(Point, 4326) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN shape geometry(Polygon, 4326) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN length float8 NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN nodes jsonb`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN updated_at timestamptz default CURRENT_TIMESTAMP`);
        await queryRunner.query(`CREATE INDEX courses_departure_idx ON "courses" USING gist (departure)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX courses_departure_idx`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN updated_at`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN nodes`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN length`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN shape`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN departure`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN n_completed integer`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN time integer`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN length float8`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN departure geometry(Point, 4326)`);
    }

}
