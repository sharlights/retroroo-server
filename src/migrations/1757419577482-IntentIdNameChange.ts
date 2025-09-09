import { MigrationInterface, QueryRunner } from "typeorm";

export class IntentIdNameChange1757419577482 implements MigrationInterface {
    name = 'IntentIdNameChange1757419577482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_template" DROP CONSTRAINT "FK_beeb75c14807c6bb559870d998b"`);
        await queryRunner.query(`ALTER TABLE "retro_template" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "retro_template" DROP COLUMN "intentionId"`);
        await queryRunner.query(`ALTER TABLE "retro_template" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "retro_template" ADD "intention_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "retro_template" ADD CONSTRAINT "FK_b1acd460436c53047c51f38fdb3" FOREIGN KEY ("intention_id") REFERENCES "intention"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_template" DROP CONSTRAINT "FK_b1acd460436c53047c51f38fdb3"`);
        await queryRunner.query(`ALTER TABLE "retro_template" DROP COLUMN "intention_id"`);
        await queryRunner.query(`ALTER TABLE "retro_template" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "retro_template" ADD "intentionId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "retro_template" ADD "isActive" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "retro_template" ADD CONSTRAINT "FK_beeb75c14807c6bb559870d998b" FOREIGN KEY ("intentionId") REFERENCES "intention"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
