import { MigrationInterface, QueryRunner } from "typeorm";

export class CardOrderRank1758411040111 implements MigrationInterface {
    name = 'CardOrderRank1758411040111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // rename
        await queryRunner.query(`ALTER TABLE "retro_card" RENAME COLUMN "rank" TO "order_rank"`);

      // Backfill any nulls with a placeholder
      await queryRunner.query(
        `UPDATE "retro_card" SET "order_rank" = '0|aaaa' WHERE "order_rank" IS NULL`
      );

        await queryRunner.query(`ALTER TABLE "retro_card" ALTER COLUMN "order_rank" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_card" ALTER COLUMN "order_rank" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "retro_card" RENAME COLUMN "order_rank" TO "rank"`);
    }

}
