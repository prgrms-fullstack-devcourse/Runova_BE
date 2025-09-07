import { MigrationInterface, QueryRunner } from "typeorm";

export class Courses1757151654525 implements MigrationInterface {
    name = Courses1757151654525.name;

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS departure`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS length`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS departure geometry(Point, 4326) NOT NULL GENERATED ALWAYS AS ( st_startpoint(courses.path) ) STORED `);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS length float8 NOT NULL GENERATED ALWAYS AS ( st_length(st_transform(courses.path, 5179)) ) STORED `);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN title SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX courses_departure_idx ON "courses" USING gist(departure)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS courses_departure_idx`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN title DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS length`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS departure`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS length double precision`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS departure geometry(Point, 4326)`);
    }
}
