import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { RetroListEntity } from '../lists/retro-list.entity';
import { RetroVoteEntity } from './retro-card-vote.entity';
import { RetroBoardEntity } from '../retro-board.entity';

@Entity('retro_card')
export class RetroCardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  clientId: string | null;

  @Column()
  creatorId: string;

  @Column()
  message: string;

  @ManyToOne(() => RetroBoardEntity, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'boardId' })
  board: RetroBoardEntity;

  @OneToMany(() => RetroVoteEntity, (vote) => vote.card, {
    cascade: true,
    eager: true,
  })
  votes: RetroVoteEntity[];

  @ManyToOne(() => RetroListEntity, (list) => list.cards, { onDelete: 'CASCADE', eager: true })
  list: RetroListEntity;

  @Column({ name: 'order_rank' })
  orderRank: string;
}
