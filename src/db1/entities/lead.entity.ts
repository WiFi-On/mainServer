import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Partner } from './partner.entity';

@Entity('leads')
export class Lead {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'text', nullable: false })
  fio: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  tel: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @CreateDateColumn({ type: 'timestamp' })
  date_create: Date;

  @ManyToOne(() => Partner, (partner) => partner.leads, { eager: true }) // Подгрузка партнера
  @JoinColumn({ name: 'partner_id' }) // Явно указываем имя столбца
  partner: Partner;

  @Column({ type: 'text', nullable: true })
  comment: string;
}
