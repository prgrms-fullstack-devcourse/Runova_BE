import { MigrationInterface, QueryRunner } from "typeorm";

export class RunningRecords1757152535315 implements MigrationInterface {
    name = 'RunningRecords1757152535315';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN distance TYPE float8`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN pace TYPE float8`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN calories TYPE float8`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN calories TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN pace TYPE double precision`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN distance TYPE double precision`);
    }
}
