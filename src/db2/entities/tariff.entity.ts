import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tariffs')
export class Tariff {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  region: string;

  @Column('jsonb')
  techs: object;

  @Column('jsonb')
  cities: object;

  @Column('jsonb')
  options: object;

  @Column()
  type_id: number;
}
