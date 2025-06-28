import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { RetroCardEntity } from '../card/retro-card.entity';
import { RetroBoardEntity } from '../retro-board.entity';

@Entity('retro_list')
export class RetroListEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  subtitle: string;

  @Column()
  colour: string;

  @Column()
  order: number;

  @ManyToOne(() => RetroBoardEntity, { onDelete: 'CASCADE', eager: true })
  board: RetroBoardEntity;

  @OneToMany(() => RetroCardEntity, (card) => card.list, {
    cascade: true,
  })
  cards: RetroCardEntity[];
}
