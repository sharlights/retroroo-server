import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RetroCardEntity } from './retro-card.entity';

@Entity('retro_vote')
@Index(['card', 'userId'], { unique: true }) // One vote per user per card
export class RetroVoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  count: number;

  @ManyToOne(() => RetroCardEntity, (card) => card.votes, { onDelete: 'CASCADE' })
  card: RetroCardEntity;
}
