import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756194142653 implements MigrationInterface {
    name = 'Init1756194142653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_nodes" RENAME COLUMN "location" TO "coordinates"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "departure"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "time"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "head" geometry(Point,5179) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "path" geometry(LineString,4326) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "hours" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "course_nodes" DROP COLUMN "coordinates"`);
        await queryRunner.query(`ALTER TABLE "course_nodes" ADD "coordinates" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LineString,4326)`);
        await queryRunner.query(`CREATE INDEX "IDX_62deab96d2651ef94daf1c62eb" ON "courses" ("head") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_62deab96d2651ef94daf1c62eb"`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LINESTRING,4326)`);
        await queryRunner.query(`ALTER TABLE "course_nodes" DROP COLUMN "coordinates"`);
        await queryRunner.query(`ALTER TABLE "course_nodes" ADD "coordinates" geometry(POINT,4326) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "hours"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "path"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "head"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "time" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "departure" geometry(POINT,4326) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "course_nodes" RENAME COLUMN "coordinates" TO "location"`);
    }

}
