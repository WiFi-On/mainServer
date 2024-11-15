import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Partner } from './partner.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column()
  token: string;

  @CreateDateColumn({ type: 'timestamp' })
  token_lifetime: Date;

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  @JoinColumn({ name: 'role_id' }) // Указываем имя колонки
  role: Role;

  @Column({ nullable: true }) // Поле может быть пустым
  partner_id: number;

  @ManyToOne(() => Partner, { nullable: true })
  @JoinColumn({ name: 'partner_id' }) // Указываем имя колонки
  partner: Partner;
}
