import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757296764557 implements MigrationInterface {
    name = 'Init1757296764557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP CONSTRAINT "FK_5d107725a307ded745e9bac5b5b"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP CONSTRAINT "FK_2ed79e4f5dab30ed7d08427213d"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP COLUMN "taked_time"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP COLUMN "courseId"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatarKey" character varying(512)`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD "record_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD "recordId" integer`);
        await queryRunner.query(`ALTER TABLE "course_nodes" ALTER COLUMN "location" TYPE geometry(Point,4326)`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "path" TYPE geometry(LineString,4326)`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "departure" TYPE geometry(Point,4326)`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LineString,4326)`);
        await queryRunner.query(`CREATE INDEX "IDX_ecf2ed336518115b7cf01f2645" ON "completed_courses" ("record_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_79719e75c156d30d686e9b6066" ON "completed_courses" ("course_id", "user_id") `);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD CONSTRAINT "UQ_a692f1fdaef132250518035fd7b" UNIQUE ("course_id", "record_id")`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD CONSTRAINT "FK_e35b3e0f2da4a03a29cf6decc8b" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD CONSTRAINT "FK_6566f56101719de137888cf5f3d" FOREIGN KEY ("recordId") REFERENCES "running_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD CONSTRAINT "FK_2099113ca5c29d71469ffdddd9a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP CONSTRAINT "FK_2099113ca5c29d71469ffdddd9a"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP CONSTRAINT "FK_6566f56101719de137888cf5f3d"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP CONSTRAINT "FK_e35b3e0f2da4a03a29cf6decc8b"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP CONSTRAINT "UQ_a692f1fdaef132250518035fd7b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_79719e75c156d30d686e9b6066"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ecf2ed336518115b7cf01f2645"`);
        await queryRunner.query(`ALTER TABLE "running_records" ALTER COLUMN "path" TYPE geometry(LINESTRING,4326)`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "departure" TYPE geometry(POINT,4326)`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "path" TYPE geometry(LINESTRING,4326)`);
        await queryRunner.query(`ALTER TABLE "course_nodes" ALTER COLUMN "location" TYPE geometry(POINT,4326)`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP COLUMN "recordId"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP COLUMN "record_id"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarKey"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD "courseId" integer`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD "taked_time" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD CONSTRAINT "FK_2ed79e4f5dab30ed7d08427213d" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD CONSTRAINT "FK_5d107725a307ded745e9bac5b5b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
