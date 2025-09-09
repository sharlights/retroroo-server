import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTemplates1757417945167 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    /* Intention ID reference
     1 = Continuous Improvement
     2 = Team Alignment
     3 = Health Check
     4 = Innovation
     5 = Post Mortem
     6 = Retro the Retro
    */

    // Templates
    await queryRunner.query(`
      insert into retro_template (name, description, version, "is_active", "intention_id")
      values
        -- Continuous Improvement (1)
        ('Start / Stop / Continue', 'Simple habits-focused board', '1', true, 1),
        ('KALM (Keep/Add/Less/More)', 'Tune team practices by deciding what to keep, add, do less or more of.', '1', true, 1),
        ('4Ls', 'Liked, Learned, Lacked, Longed for.', '1', true, 1),

        -- Team Alignment (2)
        ('Sailboat', 'Sailboat retrospective board', '1', true, 2),
        ('Team Radar', 'Surface alignment gaps across dimensions (mission, roles, WIP, comms).', '1', true, 2),
        ('Circle of Influence / Control', 'Focus on what we can act on.', '1', true, 2),
        ('Mission / Values Check', 'Lists for each core value with examples.', '1', true, 2),
        ('North Star', 'Current State, Target State, Steps to Align.', '1', true, 2),

        -- Health Check (3)
        ('4Ls', 'Liked, Learned, Lacked, Longed For', '1', true, 3),
        ('Mad / Sad / Glad', 'Emotional health check to reveal friction and wins.', '1', true, 3),
        ('Wellbeing Check-in', 'Energy, stress, focus, support.', '1', true, 3),
        ('Mood Weather', 'Weather-style mood to surface wellbeing.', '1', true, 3),
        ('Workload & Capacity', 'Load, focus time, interruptions, overtime.', '1', true, 3),

        -- Innovation (4)
        ('Moonshots', 'Big ideas with potential impact.', '1', true, 4),
        ('Shark Tank', 'Pitch, Value, Feasibility, Next Step.', '1', true, 4),
        ('Lean Coffee', 'Structured, time-boxed idea discussion with democratised prioritisation.', '1', true, 4),
        ('Lightning Demos', 'Share quick demos of ideas/inspirations to spark solutions.', '1', true, 4),
        ('Stop / Start / Try', 'Adds Try column for experiments.', '1', true, 4)
    `);

    // Lists per template
    await queryRunner.query(`
      -- Continuous Improvement
      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Start',    'Actions to begin',      '#22c55e', 1),
        ('Stop',     'Actions to halt',       '#ef4444', 2),
        ('Continue', 'Actions to maintain',   '#3b82f6', 3)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Start / Stop / Continue' and t.intention_id = 1;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Keep', '#22c55e', 'What to keep doing', 1),
        ('Add',  '#3b82f6', 'What to add/try',    2),
        ('Less', '#f59e0b', 'Do less of',         3),
        ('More', '#8b5cf6', 'Do more of',         4)
      ) as v(title, colour, subtitle, "order") on true
      where t.name = 'KALM (Keep/Add/Less/More)' and t.intention_id = 1;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Liked',      'What went well',           '#22c55e', 1),
        ('Learned',    'New insights/skills',      '#3b82f6', 2),
        ('Lacked',     'Gaps / needs',             '#f59e0b', 3),
        ('Longed For', 'Wish we had / wanted',     '#ec4899', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = '4Ls' and t.intention_id = 1;

      -- Team Alignment
      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Wind',   'Enablers pushing us forward', '#22c55e', 1),
        ('Anchors','Blockers holding us back',    '#ef4444', 2),
        ('Rocks',  'Risks ahead',                 '#f59e0b', 3),
        ('Land',   'Goals / destination',         '#3b82f6', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Sailboat' and t.intention_id = 2;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Mission',       'Clarity & alignment',    '#3b82f6', 1),
        ('Roles',         'Clear responsibilities', '#8b5cf6', 2),
        ('WIP',           'Work-in-progress load',  '#f59e0b', 3),
        ('Communication', 'Signals & feedback',     '#14b8a6', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Team Radar' and t.intention_id = 2;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Control',    'Things we control',    '#22c55e', 1),
        ('Influence',  'Things we influence',  '#3b82f6', 2),
        ('No Control', 'Acknowledge / park',   '#6b7280', 3)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Circle of Influence / Control' and t.intention_id = 2;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Values Working',  'Lived well',     '#22c55e', 1),
        ('Values Unclear',  'Needs clarity',  '#f59e0b', 2),
        ('Values Not Lived','Gaps to address','#ef4444', 3),
        ('Examples',        'Concrete examples','#3b82f6',4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Mission / Values Check' and t.intention_id = 2;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Current State', 'Where we are now',     '#6b7280', 1),
        ('Target State',  'Where we want to be',  '#22c55e', 2),
        ('Steps',         'How we get there',     '#3b82f6', 3)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'North Star' and t.intention_id = 2;

      -- Health Check
      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Liked',      'What went well',       '#22c55e', 1),
        ('Learned',    'New insights/skills',  '#3b82f6', 2),
        ('Lacked',     'Gaps / needs',         '#f59e0b', 3),
        ('Longed For', 'Wish we had / wanted', '#ec4899', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = '4Ls' and t.intention_id = 3;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Mad',  'Frustrations', '#ef4444', 1),
        ('Sad',  'Disappointments', '#3b82f6', 2),
        ('Glad', 'Wins', '#22c55e', 3)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Mad / Sad / Glad' and t.intention_id = 3;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Energy',  'How energised are we?', '#f59e0b', 1),
        ('Stress',  'Stressors & load',      '#ef4444', 2),
        ('Focus',   'Ability to focus',      '#3b82f6', 3),
        ('Support', 'Support & connection',  '#22c55e', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Wellbeing Check-in' and t.intention_id = 3;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Sunny',   'Feeling great',     '#f59e0b', 1),
        ('Cloudy',  'Meh / uncertain',   '#6b7280', 2),
        ('Rainy',   'Low mood',          '#3b82f6', 3),
        ('Stormy',  'Overwhelmed',       '#ef4444', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Mood Weather' and t.intention_id = 3;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Load',          'How much work',           '#f59e0b', 1),
        ('Focus Time',    'Protected deep-work time','#3b82f6', 2),
        ('Interruptions', 'Context switching',       '#ef4444', 3),
        ('Overtime',      'After-hours work',        '#8b5cf6', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Workload & Capacity' and t.intention_id = 3;

      -- Innovation
      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Big Ideas', 'Moonshot concepts', '#3b82f6', 1),
        ('Impact',    'Potential outcome', '#22c55e', 2),
        ('Risks',     'What could go wrong', '#ef4444', 3),
        ('Next Steps','Experiments/actions', '#8b5cf6', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Moonshots' and t.intention_id = 4;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Pitch',       'The idea succinctly', '#3b82f6', 1),
        ('Value',       'User/business value', '#22c55e', 2),
        ('Feasibility', 'Cost & complexity',   '#f59e0b', 3),
        ('Next Step',   'What to do next',     '#8b5cf6', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Shark Tank' and t.intention_id = 4;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('To Discuss', 'Ideas backlog', '#6b7280', 1),
        ('Discussing', 'In progress',   '#3b82f6', 2),
        ('Discussed',  'Done',          '#22c55e', 3),
        ('Actions',    'Follow-ups',    '#8b5cf6', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Lean Coffee' and t.intention_id = 4;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Problem',       'What we saw',       '#ef4444', 1),
        ('Inspiration',   'Sources/solutions', '#3b82f6', 2),
        ('Key Takeaways', 'What we learned',   '#22c55e', 3),
        ('Next Steps',    'Try/Prototype',     '#8b5cf6', 4)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Lightning Demos' and t.intention_id = 4;

      insert into retro_template_list (template_id, title, subtitle, colour, "order")
      select t.id, v.title, v.subtitle, v.colour, v."order"
      from retro_template t
      join (values
        ('Stop', 'Cease doing',    '#ef4444', 1),
        ('Start','Begin doing',    '#22c55e', 2),
        ('Try',  'Experiment with','#3b82f6', 3)
      ) as v(title, subtitle, colour, "order") on true
      where t.name = 'Stop / Start / Try' and t.intention_id = 4;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // optional: delete by intention_id in reverse if needed
  }
}


