import { MigrationInterface, QueryRunner } from "typeorm";

export class CardRank1758410906844 implements MigrationInterface {
    name = 'CardRank1758410906844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_card" RENAME COLUMN "index" TO "rank"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_card" RENAME COLUMN "rank" TO "index"`);
    }

}
