import { MigrationInterface, QueryRunner } from "typeorm";

export class CardIndexLexoRank1758353838528 implements MigrationInterface {
    name = 'CardIndexLexoRank1758353838528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_card" DROP COLUMN "index"`);
        await queryRunner.query(`ALTER TABLE "retro_card" ADD "index" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_card" DROP COLUMN "index"`);
        await queryRunner.query(`ALTER TABLE "retro_card" ADD "index" integer`);
    }

}
