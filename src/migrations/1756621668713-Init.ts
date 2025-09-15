import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756621668713 implements MigrationInterface {
  name = "Init1756621668713";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_62deab96d2651ef94daf1c62eb"`
    );
    await queryRunner.query(
      `ALTER TABLE "course_nodes" RENAME COLUMN "coordinates" TO "location"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "head"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "path"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "hours"`);
    await queryRunner.query(
      `ALTER TABLE "running_records" DROP COLUMN "start_at"`
    );
    await queryRunner.query(
      `ALTER TABLE "running_records" DROP COLUMN "end_at"`
    );
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "departure" geometry(Point,4326) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "time" double precision NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "course_nodes" DROP COLUMN "location"`
    );
    await queryRunner.query(
      `ALTER TABLE "course_nodes" ADD "location" geometry(Point,4326) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LineString,4326)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LINESTRING,4326)`
    );
    await queryRunner.query(
      `ALTER TABLE "course_nodes" DROP COLUMN "location"`
    );
    await queryRunner.query(
      `ALTER TABLE "course_nodes" ADD "location" jsonb NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "time"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "departure"`);
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "running_records" ADD "end_at" TIMESTAMP WITH TIME ZONE NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "running_records" ADD "start_at" TIMESTAMP WITH TIME ZONE NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "hours" double precision NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "path" geometry(LINESTRING,4326) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "head" geometry(POINT,5179) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "course_nodes" RENAME COLUMN "location" TO "coordinates"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_62deab96d2651ef94daf1c62eb" ON "courses" ("head") `
    );
  }
}
