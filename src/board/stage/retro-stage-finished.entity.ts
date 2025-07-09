import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { RetroStage } from '../../types/stages';
import { RetroUserEntity } from '../users/retro-user.entity';
import { RetroBoardEntity } from '../retro-board.entity';

@Entity('stage_completion')
@Unique(['stage', 'board', 'user'])
export class RetroStageFinishedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RetroBoardEntity, { nullable: false })
  board: RetroBoardEntity;

  @Column({
    type: 'enum',
    enum: ['headspace', 'explore', 'vote', 'discuss', 'done'],
  })
  stage: RetroStage;

  @ManyToOne(() => RetroUserEntity, { nullable: false })
  user: RetroUserEntity;
}
