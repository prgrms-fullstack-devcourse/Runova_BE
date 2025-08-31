import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756622328133 implements MigrationInterface {
    name = 'Init1756622328133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "course_nodes" ALTER COLUMN "location" TYPE geometry(Point,4326)`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "departure" TYPE geometry(Point,4326)`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LineString,4326)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LINESTRING,4326)`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "departure" TYPE geometry(POINT,4326)`);
        await queryRunner.query(`ALTER TABLE "course_nodes" ALTER COLUMN "location" TYPE geometry(POINT,4326)`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    }

}
