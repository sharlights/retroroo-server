import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RetroTemplateEntity } from './retro-template.entity';

@Entity('retro_template_list')
export class RetroTemplateListEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RetroTemplateEntity, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'template_id', referencedColumnName: 'id' })
  template: RetroTemplateEntity;

  @Column()
  title: string;

  @Column()
  subtitle: string;

  @Column()
  colour: string;

  @Column()
  order: number;
}
