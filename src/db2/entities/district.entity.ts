import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('districts')
export class District {
  @PrimaryColumn()
  id: number;

  @Column()
  region: string;

  @Column()
  name: string;

  @Column()
  object: string;

  @Column()
  parent_id: number;
}
