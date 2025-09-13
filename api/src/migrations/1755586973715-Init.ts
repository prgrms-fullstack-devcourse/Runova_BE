import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1755586973715 implements MigrationInterface {
    name = 'Init1755586973715'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "title" text NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."posts_type_enum" RENAME TO "posts_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."posts_type_enum" AS ENUM('FREE', 'PROOF', 'SHARE', 'MATE')`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "type" TYPE "public"."posts_type_enum" USING "type"::"text"::"public"."posts_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."posts_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."posts_type_enum_old" AS ENUM('FREE', 'PROOF', 'SHARE')`);
        await queryRunner.query(`ALTER TABLE "posts" ALTER COLUMN "type" TYPE "public"."posts_type_enum_old" USING "type"::"text"::"public"."posts_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."posts_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."posts_type_enum_old" RENAME TO "posts_type_enum"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "title"`);
    }

}
