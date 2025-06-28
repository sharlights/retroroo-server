import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { RetroStage } from '../types/stages';

@Entity('board')
export class RetroBoardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdDate: Date;

  @Column({
    type: 'enum',
    enum: ['headspace', 'explore', 'vote', 'discuss', 'done'],
  })
  stage: RetroStage;
}
