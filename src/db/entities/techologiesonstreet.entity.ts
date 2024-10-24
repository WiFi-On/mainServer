import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('techologiesonstreet')
export class TechologiesOnStreet {
  @PrimaryColumn()
  id: string;

  @Column()
  internet_speed: number;
}
