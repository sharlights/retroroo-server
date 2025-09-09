import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RetroIntentEntity } from '../../intent/retro-intent.entity';
import { RetroTemplateListEntity } from './retro-template-list.entity';

@Entity('retro_template')
export class RetroTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  version: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => RetroIntentEntity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'intention_id', referencedColumnName: 'id' })
  intention: RetroIntentEntity;

  @OneToMany(() => RetroTemplateListEntity, (list) => list.template, {
    cascade: ['insert', 'update'],
  })
  lists: RetroTemplateListEntity[];
}
