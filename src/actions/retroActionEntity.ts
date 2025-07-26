import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { RetroBoardEntity } from '../board/retro-board.entity';
import { RetroUserEntity } from '../board/users/retro-user.entity';

@Entity('actions')
export class RetroActionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RetroBoardEntity, { onDelete: 'CASCADE', eager: true })
  board: RetroBoardEntity;

  @Column()
  description: string;

  @ManyToOne(() => RetroUserEntity, { eager: true, onDelete: 'SET NULL' })
  createdBy: RetroUserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
