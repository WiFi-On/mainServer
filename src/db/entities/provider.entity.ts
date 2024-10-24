import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Tariff } from './tariff.entity'; // Импортируйте сущность Tariff

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Tariff, (tariff) => tariff.provider)
  tariffs: Tariff[]; // Добавляем связь с тарифами
}
