import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RetroStage } from '../types/stages';
import { RetroIntentEntity } from '../intent/retro-intent.entity';

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
}
