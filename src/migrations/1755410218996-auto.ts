import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1755410218996 implements MigrationInterface {
    name = 'Auto1755410218996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "postId" integer NOT NULL, "authorId" integer NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e44ddaaa6d058cb4092f83ad61" ON "comments" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4548cc4a409b8651ec75f70e28" ON "comments" ("authorId") `);
        await queryRunner.query(`CREATE TABLE "post_likes" ("id" SERIAL NOT NULL, "postId" integer NOT NULL, "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_30ee85070afe5b92b5920957b1c" UNIQUE ("postId", "userId"), CONSTRAINT "PK_e4ac7cb9daf243939c6eabb2e0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6999d13aca25e33515210abaf1" ON "post_likes" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_37d337ad54b1aa6b9a44415a49" ON "post_likes" ("userId") `);
        await queryRunner.query(`CREATE TABLE "completed_courses" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "course_id" integer NOT NULL, "taked_time" double precision NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, "courseId" integer, CONSTRAINT "PK_61d054bfa3e5ee30bdfde6b08fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2099113ca5c29d71469ffdddd9" ON "completed_courses" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e35b3e0f2da4a03a29cf6decc8" ON "completed_courses" ("course_id") `);
        await queryRunner.query(`CREATE TABLE "courses" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "length" double precision NOT NULL, "path" geometry(Polygon,4326) NOT NULL, "n_completed" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a4396a5235f159ab156a6f8b60" ON "courses" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "nickname" character varying NOT NULL, "avatarUrl" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ad02a1be8707004cb805a4b502" ON "users" ("nickname") `);
        await queryRunner.query(`CREATE TYPE "public"."posts_type_enum" AS ENUM('FREE', 'PROOF', 'SHARE')`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" SERIAL NOT NULL, "authorId" integer NOT NULL, "type" "public"."posts_type_enum" NOT NULL, "content" text NOT NULL, "imageUrls" text array NOT NULL DEFAULT '{}', "routeId" integer, "likeCount" integer NOT NULL DEFAULT '0', "commentCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isDeleted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c5a322ad12a7bf95460c958e80" ON "posts" ("authorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_560752d45d78a3332853345e32" ON "posts" ("type") `);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_6999d13aca25e33515210abaf16" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD CONSTRAINT "FK_5d107725a307ded745e9bac5b5b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "completed_courses" ADD CONSTRAINT "FK_2ed79e4f5dab30ed7d08427213d" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_8e0ef34f8d606c64586e698abc1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_8e0ef34f8d606c64586e698abc1"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP CONSTRAINT "FK_2ed79e4f5dab30ed7d08427213d"`);
        await queryRunner.query(`ALTER TABLE "completed_courses" DROP CONSTRAINT "FK_5d107725a307ded745e9bac5b5b"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_37d337ad54b1aa6b9a44415a498"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_6999d13aca25e33515210abaf16"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_560752d45d78a3332853345e32"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5a322ad12a7bf95460c958e80"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TYPE "public"."posts_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ad02a1be8707004cb805a4b502"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4396a5235f159ab156a6f8b60"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e35b3e0f2da4a03a29cf6decc8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2099113ca5c29d71469ffdddd9"`);
        await queryRunner.query(`DROP TABLE "completed_courses"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_37d337ad54b1aa6b9a44415a49"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6999d13aca25e33515210abaf1"`);
        await queryRunner.query(`DROP TABLE "post_likes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4548cc4a409b8651ec75f70e28"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e44ddaaa6d058cb4092f83ad61"`);
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}
