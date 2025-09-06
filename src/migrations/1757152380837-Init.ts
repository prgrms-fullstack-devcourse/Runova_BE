import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757152380837 implements MigrationInterface {
    name = 'Init1756951695806';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "completed_courses"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "running_dashboards"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
