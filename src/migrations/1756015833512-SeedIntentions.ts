import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedIntentions1756015833512 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO intention (id, name, description) VALUES
        (1, 'Continuous Improvement', 'Focus on iterative process and product improvements.'),
        (2, 'Team Alignment', 'Ensure the team is aligned on goals, ways of working, and priorities.'),
        (3, 'Health Check', 'Analyze an incident/outage and prevent recurrence.'),
        (4, 'Innovation', 'Analyze an incident/outage and prevent recurrence.'),
        (5, 'Post Mortem', 'Analyze an incident/outage and prevent recurrence.'),
        (6, 'Retro the Retro', 'Improve how we run retrospectives themselves.')
        ON CONFLICT (id) DO UPDATE
                              SET name = EXCLUDED.name,
                              description = EXCLUDED.description;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM intention WHERE id IN (1,2,3,4);
    `);
  }
}
