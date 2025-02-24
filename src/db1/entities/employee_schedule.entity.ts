import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ScheduleUser } from './schedule_user.entity'; // Убедитесь, что путь правильный

@Entity('employee_schedule')
export class EmployeeSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time', nullable: false })
  start_time: string;

  @Column({ type: 'time', nullable: false })
  end_time: string;

  @Column({ type: 'date', nullable: false })
  date: string;

  @Column({ type: 'boolean', nullable: false })
  office: boolean;

  @Column({ type: 'varchar', nullable: false })
  user_id: string; // Храним внешний ключ

  @ManyToOne(() => ScheduleUser, { nullable: false }) // Определяем связь с ScheduleUser
  @JoinColumn({ name: 'user_id' }) // Указываем, что внешний ключ связан с user_id
  user: ScheduleUser; // Это свойство будет автоматически заполняться объектом ScheduleUser

  @Column({
    type: 'text',
    nullable: false,
    default: 'В ожидании',
    enum: ['Отказ', 'Согласовано', 'В ожидании'],
  })
  status: string;
}
