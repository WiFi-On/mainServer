import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('schedule_users')
export class ScheduleUser {
  @PrimaryGeneratedColumn()
  telegram_id: number;

  @Column({ type: 'boolean' })
  admin: boolean;
}
