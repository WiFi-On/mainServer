import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ActiveDay } from './active_day.entity'; // Импортируем ActiveDay entity

@Entity('schedule_users')
export class ScheduleUser {
  @PrimaryGeneratedColumn()
  telegram_id: number;

  @Column({ type: 'boolean' })
  admin: boolean;

  @OneToMany(() => ActiveDay, (activeDay) => activeDay.idWorker)
  activeDays: ActiveDay[];
}
