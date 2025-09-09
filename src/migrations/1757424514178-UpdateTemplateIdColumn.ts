import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTemplateIdColumn1757424514178 implements MigrationInterface {
    name = 'UpdateTemplateIdColumn1757424514178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_template_list" DROP CONSTRAINT "FK_9f98f6093033c770fdedd23fb23"`);
        await queryRunner.query(`ALTER TABLE "retro_template_list" RENAME COLUMN "templateId" TO "template_id"`);
        await queryRunner.query(`ALTER TABLE "retro_template_list" ADD CONSTRAINT "FK_9dbf46c43ecd31a217649a08cac" FOREIGN KEY ("template_id") REFERENCES "retro_template"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "retro_template_list" DROP CONSTRAINT "FK_9dbf46c43ecd31a217649a08cac"`);
        await queryRunner.query(`ALTER TABLE "retro_template_list" RENAME COLUMN "template_id" TO "templateId"`);
        await queryRunner.query(`ALTER TABLE "retro_template_list" ADD CONSTRAINT "FK_9f98f6093033c770fdedd23fb23" FOREIGN KEY ("templateId") REFERENCES "retro_template"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
