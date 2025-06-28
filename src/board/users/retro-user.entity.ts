import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BoardRole } from '../../types/roles';
import { RetroBoardEntity } from '../retro-board.entity';

@Entity('retro_user')
export class RetroUserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RetroBoardEntity, { onDelete: 'CASCADE', eager: true })
  board: RetroBoardEntity;

  @Column()
  role: BoardRole;

  @Column({ default: 0 })
  sessionCount: number;
}
