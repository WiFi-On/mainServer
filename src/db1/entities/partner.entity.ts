import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Lead } from './lead.entity';

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  name: string;

  @OneToMany(() => Lead, (lead) => lead.partner)
  leads: Lead[];
}
