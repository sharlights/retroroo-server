import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { RetroListEntity } from '../lists/retro-list.entity';
import { RetroVoteEntity } from './retro-card-vote.entity';

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
