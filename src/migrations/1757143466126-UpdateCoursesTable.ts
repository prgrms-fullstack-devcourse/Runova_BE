import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCoursesTable1757143466126 implements MigrationInterface {
    name = "UpdateCoursesTable1757143466126";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN time`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN n_completed`);
        await queryRunner.query('ALTER TABLE "courses" ADD COLUMN path geometry(LineString, 4326)');
        await queryRunner.query('ALTER TABLE "courses" ADD COLUMN title varchar(255)');
        await queryRunner.query('ALTER TABLE "courses" ADD COLUMN image_url varchar(255)');
        await queryRunner.query('ALTER TABLE "courses" ADD COLUMN updated_at timestamptz default CURRENT_TIMESTAMP');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "courses" DROP COLUMN updated_at');
        await queryRunner.query('ALTER TABLE "courses" DROP COLUMN image_url');
        await queryRunner.query('ALTER TABLE "courses" DROP COLUMN title');
        await queryRunner.query('ALTER TABLE "courses" DROP COLUMN path');
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN n_completed integer`);
        await queryRunner.query(`ALTER TABLE "courses" ADD COLUMN time integer`);
    }

}
