import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIntentionTable1756015709223 implements MigrationInterface {
  name = 'CreateIntentionTable1756015709223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "intention" ("id" integer NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "UQ_719422d03d53bac3b9bb04a4cc4" UNIQUE ("name"), CONSTRAINT "PK_0dbf3120b04c6b15bf0af43ce42" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "board" ADD "intentionId" integer`);
    await queryRunner.query(
      `ALTER TABLE "board" ADD CONSTRAINT "FK_fb8a1d9c498d1d80c47c02a3174" FOREIGN KEY ("intentionId") REFERENCES "intention"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "board" DROP CONSTRAINT "FK_fb8a1d9c498d1d80c47c02a3174"`);
    await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "intentionId"`);
    await queryRunner.query(`DROP TABLE "intention"`);
  }
}
