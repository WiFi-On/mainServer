import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('employee_schedule')
export class EmployeeSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time', nullable: false })
  start_time: string; // TIME в SQL представлено как string в TypeScript

  @Column({ type: 'time', nullable: false })
  end_time: string;

  @Column({ type: 'date', nullable: false })
  date: string; // DATE в SQL также представлен как string

  @Column({ type: 'boolean', nullable: false })
  office: boolean;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({
    type: 'text',
    nullable: false,
    default: 'В ожидании',
    enum: ['Отказ', 'Согласовано', 'В ожидании'], // Симулирует CHECK в TypeORM
  })
  status: string;
}
