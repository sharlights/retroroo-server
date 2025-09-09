import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column()
  isActive: boolean;

  @ManyToOne(() => RetroIntentEntity, { nullable: false, onDelete: 'RESTRICT' })
  intention: RetroIntentEntity;

  @OneToMany(() => RetroTemplateListEntity, (list) => list.template, {
    cascade: ['insert', 'update'],
  })
  lists: RetroTemplateListEntity[];
}
