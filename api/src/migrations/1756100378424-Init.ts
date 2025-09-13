import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756100378424 implements MigrationInterface {
    name = 'Init1756100378424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP CONSTRAINT "UQ_e2851f6842b0fa1d9e030cb8355"`);
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP COLUMN "provider"`);
        await queryRunner.query(`CREATE TYPE "public"."oauth_provider" AS ENUM('GOOGLE')`);
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD "provider" "public"."oauth_provider" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP COLUMN "providerUserId"`);
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD "providerUserId" character varying(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD CONSTRAINT "UQ_e2851f6842b0fa1d9e030cb8355" UNIQUE ("provider", "providerUserId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP CONSTRAINT "UQ_e2851f6842b0fa1d9e030cb8355"`);
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP COLUMN "providerUserId"`);
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD "providerUserId" character varying(128) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "social_accounts" DROP COLUMN "provider"`);
        await queryRunner.query(`DROP TYPE "public"."oauth_provider"`);
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD "provider" character varying(16) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD CONSTRAINT "UQ_e2851f6842b0fa1d9e030cb8355" UNIQUE ("provider", "providerUserId")`);
        await queryRunner.query(`ALTER TABLE "social_accounts" ADD "email" character varying(320)`);
    }

}
