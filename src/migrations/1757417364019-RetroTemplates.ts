import { MigrationInterface, QueryRunner } from 'typeorm';

export class RetroTemplates1757417364019 implements MigrationInterface {
  name = 'RetroTemplates1757417364019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "retro_template_list" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "subtitle" character varying NOT NULL, "colour" character varying NOT NULL, "order" integer NOT NULL, "templateId" uuid, CONSTRAINT "PK_d5c6a1493b76f30143e8537607b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "retro_template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "version" character varying NOT NULL, "isActive" boolean NOT NULL, "intentionId" integer NOT NULL, CONSTRAINT "PK_1ee2287b55be0ed82057f26185d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "retro_template_list" ADD CONSTRAINT "FK_9f98f6093033c770fdedd23fb23" FOREIGN KEY ("templateId") REFERENCES "retro_template"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "retro_template" ADD CONSTRAINT "FK_beeb75c14807c6bb559870d998b" FOREIGN KEY ("intentionId") REFERENCES "intention"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "retro_template" DROP CONSTRAINT "FK_beeb75c14807c6bb559870d998b"`);
    await queryRunner.query(`ALTER TABLE "retro_template_list" DROP CONSTRAINT "FK_9f98f6093033c770fdedd23fb23"`);
    await queryRunner.query(`DROP TABLE "retro_template"`);
    await queryRunner.query(`DROP TABLE "retro_template_list"`);
  }
}
