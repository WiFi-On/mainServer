import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('schedule_users')
export class ScheduleUser {
  @PrimaryGeneratedColumn()
  telegram_id: number;

  @Column()
  admin: boolean;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  middle_name: string;
}
