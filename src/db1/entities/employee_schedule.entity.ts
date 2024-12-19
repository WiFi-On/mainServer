import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('employee_schedule')
export class EmployeeSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time', nullable: false })
  startTime: string; // TIME в SQL представлено как string в TypeScript

  @Column({ type: 'time', nullable: false })
  endTime: string;

  @Column({ type: 'date', nullable: false })
  date: string; // DATE в SQL также представлен как string

  @Column({ type: 'boolean', nullable: false })
  office: boolean;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({
    type: 'text',
    nullable: false,
    default: 'В ожидании',
    enum: ['Отказ', 'Согласовано', 'В ожидании'], // Симулирует CHECK в TypeORM
  })
  status: string;
}
