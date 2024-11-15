import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('active_days')
export class ActiveDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  startWorkTime: string;

  @Column({ type: 'time' })
  endWorkTime: string;

  @Column({ name: 'id_worker' })
  idWorker: number;

  @Column({ type: 'boolean' })
  office: boolean;
}
