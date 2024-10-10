import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { District } from './district.entity';

@Entity('streets')
export class Street {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => District) // связь многие к одному с Provider
  @JoinColumn({ name: 'district_id' })
  district: District;

  @Column()
  warning: boolean;

  @Column()
  name: string;
}
