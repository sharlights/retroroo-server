import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RetroStage } from '../types/stages';
import { RetroIntentEntity } from '../intent/retro-intent.entity';
import { RetroListEntity } from './lists/retro-list.entity';

@Entity('board')
export class RetroBoardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdDate: Date;

  @Column({
    type: 'enum',
    enum: RetroStage,
    enumName: 'stage',
  })
  stage: RetroStage;

  @ManyToOne(() => RetroIntentEntity, {
    eager: true,
    cascade: false,
  })
  intention: RetroIntentEntity;

  @OneToMany(() => RetroListEntity, (list) => list.board, {
    cascade: ['insert', 'update', 'remove'],
    orphanedRowAction: 'delete',
  })
  lists: RetroListEntity[];
}
