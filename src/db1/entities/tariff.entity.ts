import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Provider } from './provider.entity';
import { District } from './district.entity';

@Entity('tariffs')
export class Tariff {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => District) // связь многие к одному с District
  @JoinColumn({ name: 'district_id' })
  district: District;

  @ManyToOne(() => Provider) // связь многие к одному с Provider
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column()
  internet_speed: number;

  @Column()
  channels_count: number;

  @Column()
  minutes: number;

  @Column()
  gigabytes: number;

  @Column()
  sms: number;

  @Column()
  connection_cost: number;

  @Column()
  cost: number;

  @Column()
  sale_cost: number;

  @Column()
  sale_description: string;

  @Column()
  name: string;

  @Column()
  router_rent: number;

  @Column()
  router_cost: number;

  @Column()
  router_payment: number;

  @Column()
  tv_box_rent: number;

  @Column()
  tv_box_cost: number;

  @Column()
  tv_box_payment: number;

  @Column('jsonb') // тип данных для хранения сложных структур данных
  technologies: any;

  @Column()
  type: number;

  @Column('jsonb')
  additional_info: any;
}
