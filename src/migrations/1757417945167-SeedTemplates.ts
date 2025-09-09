import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTemplates1757417945167 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /* Intention ID reference
     1  = Continuous Improvement
     2  = Team Alignment
     3  = Health Check
     4  = Innovation
     5  = Post Mortem
     6  = Retro the Retro
   */
    await queryRunner.query(`
      insert into retro_template (name, description, version, "isActive", intention_id)
      values
        -- Continuous Improvement
        ('Start / Stop / Continue', 'Simple habits-focused board', '1', true, 1),
        ('KALM (Keep/Add/Less/More)', 'Tune team practices by deciding what to keep, add, do less or more of.', '1', true, 1),
        ('4Ls', 'Liked, Learned, Lacked, Longed for.', '1', true, 1),

        -- Team Alignment
        ('Sailboat', 'Sailboat retrospective board', '1', true, 2),
        ('Team Radar', 'Surface alignment gaps across dimensions (mission, roles, WIP, comms).', '1', true, 2),
        ('Circle of Influence / Control', 'Focus on what we can act on.', '1', true, 2),
        ('Mission / Values Check', 'Lists for each core value with examples.', '1', true, 2),
        ('North Star', 'Current State, Target State, Steps to Align.', '1', true, 2),

        -- Health Check
        ('4Ls', 'Liked, Learned, Lacked, Longed For', '1', true, 3),
        ('Mad / Sad / Glad', 'Emotional health check to reveal friction and wins.', '1', true, 3),
        ('Wellbeing Check-in',  'Energy, stress, focus, support.',                 '1', true, 3),
        ('Mood Weather',        'Weather-style mood to surface wellbeing.',        '1', true, 3),
        ('Workload & Capacity', 'Load, focus time, interruptions, overtime.',      '1', true, 3),


        -- Innovation
        ('Moonshots', 'Big ideas with potential impact.', '1', true, 4),
        ('Shark Tank', 'Pitch, Value, Feasibility, Next Step.', '1', true, 4),
        ('Lean Coffee', 'Structured, time-boxed idea discussion with democratised prioritisation.', '1', true, 4),
        ('Lightning Demos', 'Share quick demos of ideas/inspirations to spark solutions.', '1', true, 4),
        ('Stop / Start / Try', 'Adds Try column for experiments.', '1', true, 4)

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
