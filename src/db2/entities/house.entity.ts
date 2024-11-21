import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('houses')
export class House {
  @PrimaryColumn()
  id: number;

  @Column()
  region: string;

  @Column()
  house: string;

  @Column()
  street_id: number;
}
