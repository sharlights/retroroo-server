import { MigrationInterface, QueryRunner } from "typeorm";

export class CardIndex1757719751346 implements MigrationInterface {
    name = 'CardIndex1757719751346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_card" ADD "index" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_card" DROP COLUMN "index"`);
    }

}
