import { MigrationInterface, QueryRunner } from "typeorm";

export class Courses1757151654525 implements MigrationInterface {
    name = 'Courses1757151654525';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS path`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN title SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS shape geometry(Polygon, 4326) NOT NULL`);
        await queryRunner.query(`CREATE INDEX courses_departure_idx ON "courses" USING gist(departure)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS courses_departure_idx`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS shape`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN title DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS path geometry(LineString, 4326) NOT NULL`);
    }
}
