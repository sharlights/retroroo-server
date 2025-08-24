import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * IntentionEntity
 *
 * Represents the purpose or theme of a retrospective board.
 * Intentions are predefined lookup values (e.g. Continuous Improvement,
 * Team Alignment, Retro the Retro, Post Mortem) and provide context
 * for why a board is being run.
 */
@Entity('intention')
export class IntentionEntity {
  @PrimaryColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;
}
