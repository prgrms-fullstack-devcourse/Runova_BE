import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756105690233 implements MigrationInterface {
  name = "Init1756105690233";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_8e0ef34f8d606c64586e698abc1"`
    );
    await queryRunner.query(
      `CREATE TABLE "course_nodes" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "course_id" integer NOT NULL, "location" geometry(Point,4326) NOT NULL, "progress" double precision NOT NULL, "bearing" double precision NOT NULL, CONSTRAINT "PK_a92f4c09300ee47af733ab29054" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1f3275d1f87a04fd8ccd280196" ON "course_nodes" ("course_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "running_records" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "user_id" integer NOT NULL, "course_id" integer, "path" geometry(LineString,4326) NOT NULL, "start_at" TIMESTAMP WITH TIME ZONE NOT NULL, "end_at" TIMESTAMP WITH TIME ZONE NOT NULL, "distance" double precision NOT NULL, "pace" double precision NOT NULL, "calories" double precision NOT NULL, CONSTRAINT "PK_abbdab0ce14cc76da28f5c1f186" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d386977b3f6d9abb0ddb0658c5" ON "running_records" ("user_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab59f595e74cbb8f71c6bbe417" ON "running_records" ("course_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "running_dashboards" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "total_distance" double precision NOT NULL, "total_time" double precision NOT NULL, CONSTRAINT "PK_c4d5c7f7b4b0a11710abff34a19" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "path"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "userId"`);
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "departure" geometry(Point,4326) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "time" double precision NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP CONSTRAINT "UQ_e2851f6842b0fa1d9e030cb8355"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "provider"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD "provider" "public"."oauth_provider" NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "providerUserId"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD "providerUserId" character varying(64) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "createdAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD CONSTRAINT "UQ_e2851f6842b0fa1d9e030cb8355" UNIQUE ("provider", "providerUserId")`
    );
    await queryRunner.query(
      `ALTER TABLE "course_nodes" ADD CONSTRAINT "FK_1f3275d1f87a04fd8ccd280196a" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_a4396a5235f159ab156a6f8b603" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "running_records" ADD CONSTRAINT "FK_d386977b3f6d9abb0ddb0658c58" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "running_records" ADD CONSTRAINT "FK_ab59f595e74cbb8f71c6bbe4179" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "running_records" DROP CONSTRAINT "FK_ab59f595e74cbb8f71c6bbe4179"`
    );
    await queryRunner.query(
      `ALTER TABLE "running_records" DROP CONSTRAINT "FK_d386977b3f6d9abb0ddb0658c58"`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_a4396a5235f159ab156a6f8b603"`
    );
    await queryRunner.query(
      `ALTER TABLE "course_nodes" DROP CONSTRAINT "FK_1f3275d1f87a04fd8ccd280196a"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP CONSTRAINT "UQ_e2851f6842b0fa1d9e030cb8355"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "createdAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "providerUserId"`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD "providerUserId" character varying(128) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" DROP COLUMN "provider"`
    );
    await queryRunner.query(`DROP TYPE "public"."oauth_provider"`);
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD "provider" character varying(16) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "social_accounts" ADD CONSTRAINT "UQ_e2851f6842b0fa1d9e030cb8355" UNIQUE ("provider", "providerUserId")`
    );
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "time"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "departure"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "courses" ADD "userId" integer`);
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "path" geometry(POLYGON,4326) NOT NULL`
    );
    await queryRunner.query(`DROP TABLE "running_dashboards"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ab59f595e74cbb8f71c6bbe417"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d386977b3f6d9abb0ddb0658c5"`
    );
    await queryRunner.query(`DROP TABLE "running_records"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1f3275d1f87a04fd8ccd280196"`
    );
    await queryRunner.query(`DROP TABLE "course_nodes"`);
    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_8e0ef34f8d606c64586e698abc1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
