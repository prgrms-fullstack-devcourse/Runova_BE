import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756951695806 implements MigrationInterface {
    name = 'Init1756951695806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "course_bookmarks" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "course_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_8fdf6f201e3f9aa8eb96e2b96e2" UNIQUE ("course_id", "user_id"), CONSTRAINT "PK_a94c16ebae40541cc670fc4285c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bd002a5bba58906681fa5b17cc" ON "course_bookmarks" ("course_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_10f353edaebee9189c5e6c8aab" ON "course_bookmarks" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "courses" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "image_url" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "running_records" ADD "start_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "running_records" ADD "end_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "course_nodes" ALTER COLUMN "location" TYPE geometry(Point,4326)`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "departure" TYPE geometry(Point,4326)`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LineString,4326)`);
        await queryRunner.query(`ALTER TABLE "course_bookmarks" ADD CONSTRAINT "FK_bd002a5bba58906681fa5b17cc9" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_bookmarks" ADD CONSTRAINT "FK_10f353edaebee9189c5e6c8aabf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_bookmarks" DROP CONSTRAINT "FK_10f353edaebee9189c5e6c8aabf"`);
        await queryRunner.query(`ALTER TABLE "course_bookmarks" DROP CONSTRAINT "FK_bd002a5bba58906681fa5b17cc9"`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LINESTRING,4326)`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "departure" TYPE geometry(POINT,4326)`);
        await queryRunner.query(`ALTER TABLE "course_nodes" ALTER COLUMN "location" TYPE geometry(POINT,4326)`);
        await queryRunner.query(`ALTER TABLE "running_records" DROP COLUMN "end_at"`);
        await queryRunner.query(`ALTER TABLE "running_records" DROP COLUMN "start_at"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "image_url"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "updated_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_10f353edaebee9189c5e6c8aab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bd002a5bba58906681fa5b17cc"`);
        await queryRunner.query(`DROP TABLE "course_bookmarks"`);
    }

}
