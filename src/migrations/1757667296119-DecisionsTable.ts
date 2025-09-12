import { MigrationInterface, QueryRunner } from "typeorm";

export class DecisionsTable1757667296119 implements MigrationInterface {
    name = 'DecisionsTable1757667296119'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "decisions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "boardId" uuid, "createdById" uuid, CONSTRAINT "PK_48eee6fa229cd5e43648f6a2ec3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "decisions" ADD CONSTRAINT "FK_082c630fbefe75a0a104baa7899" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "decisions" ADD CONSTRAINT "FK_37957e73eeebe2a1069b9dfec5a" FOREIGN KEY ("createdById") REFERENCES "retro_user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "decisions" DROP CONSTRAINT "FK_37957e73eeebe2a1069b9dfec5a"`);
        await queryRunner.query(`ALTER TABLE "decisions" DROP CONSTRAINT "FK_082c630fbefe75a0a104baa7899"`);
        await queryRunner.query(`DROP TABLE "decisions"`);
    }

}
