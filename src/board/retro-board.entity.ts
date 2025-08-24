import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RetroStage } from '../types/stages';
import { IntentionEntity } from '../intent/retro-intent.entity';

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

  @ManyToOne(() => IntentionEntity, {
    eager: true,
    cascade: false,
  })
  intention: IntentionEntity;
}
