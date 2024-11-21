import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('streets')
export class Street {
  @PrimaryColumn()
  id: number;

  @Column()
  region: string;

  @Column()
  name: string;

  @Column()
  object: string;

  @Column()
  district_id: number;
}
