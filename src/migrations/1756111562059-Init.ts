import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756111562059 implements MigrationInterface {
    name = 'Init1756111562059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD "email" character varying(320)`);
        await queryRunner.query(`ALTER TABLE "course_nodes" ALTER COLUMN "location" TYPE geometry(Point,4326)`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "departure" TYPE geometry(Point,4326)`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LineString,4326)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LINESTRING,4326)`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "departure" TYPE geometry(POINT,4326)`);
        await queryRunner.query(`ALTER TABLE "course_nodes" ALTER COLUMN "location" TYPE geometry(POINT,4326)`);
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP COLUMN "email"`);
    }

}
