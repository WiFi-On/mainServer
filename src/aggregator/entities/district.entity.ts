import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('districts')
export class District {
  @PrimaryColumn()
  id: string;

  @Column()
  engname: string;

  @Column()
  name: string;

  @Column()
  namewhere: string;
}
